from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    """
    Quản lý kết nối WebSocket và trạng thái người dùng trong các phòng.
    """
    def __init__(self):
        # Cấu trúc: { "room_id": { "client_id": { "ws": WebSocket, "config": dict } } }
        self.active_connections: Dict[str, Dict[str, dict]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        
        # Lưu kết nối và cấu hình mặc định
        self.active_connections[room_id][client_id] = {
            "ws": websocket,
            "config": {
                "translate_mode": False,  # Mặc định tắt dịch
                "target_lang": "vi"       # Ngôn ngữ đích mặc định
            }
        }
        print(f"Client {client_id} joined room {room_id}")

    def disconnect(self, room_id: str, client_id: str):
        if room_id in self.active_connections:
            if client_id in self.active_connections[room_id]:
                del self.active_connections[room_id][client_id]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        print(f"Client {client_id} left room {room_id}")

    async def update_config(self, room_id: str, client_id: str, config: dict):
        """
        Cập nhật cấu hình dịch của user (VD: bật/tắt dịch, chọn ngôn ngữ đích).
        """
        if room_id in self.active_connections and client_id in self.active_connections[room_id]:
            self.active_connections[room_id][client_id]["config"].update(config)
            print(f"Config updated for {client_id}: {self.active_connections[room_id][client_id]['config']}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for client_info in self.active_connections[room_id].values():
                await client_info["ws"].send_text(message)

    async def process_and_route(self, room_id: str, sender_id: str, data: dict):
        """
        Logic tung tâm: Nhận dữ liệu từ Sender -> Xử lý (Colab) -> Gửi cho Receivers.
        """
        if room_id not in self.active_connections:
            return

        sender_content = data.get("content") # Audio blob hoặc Text
        sender_type = data.get("type", "text") # 'audio' hoặc 'text'

        # Duyệt qua tất cả người khác trong phòng
        for client_id, client_info in self.active_connections[room_id].items():
            if client_id == sender_id:
                continue # Bỏ qua chính mình

            receiver_ws = client_info["ws"]
            receiver_config = client_info["config"]
            
            # Logic: Nếu Receiver bật dịch -> Gửi qua Colab -> Gửi kết quả dịch về Receiver
            if receiver_config.get("translate_mode"):
                target_lang = receiver_config.get("target_lang", "vi")
                
                # Gọi Colab xử lý (Giả lập async)
                # Trong thực tế: response = await call_colab_api(sender_content, target_lang)
                if sender_type == "text":
                    translated_text = await self.mock_colab_translate(sender_content, target_lang)
                else:
                    translated_text = f"[Audio Received] Translated to {target_lang}..."

                response_payload = {
                    "type": "translation",
                    "sender_id": sender_id,
                    "original": sender_content if sender_type == "text" else "[Audio]",
                    "translated": translated_text,
                    "target_lang": target_lang
                }
                await receiver_ws.send_text(json.dumps(response_payload))
            
            else:
                # Nếu không bật dịch -> Gửi nguyên bản
                await receiver_ws.send_text(json.dumps({
                    "type": "original",
                    "sender_id": sender_id,
                    "content": sender_content
                }))

    async def mock_colab_translate(self, text: str, target_lang: str) -> str:
        """
        Giả lập gọi API Colab.
        """
        await asyncio.sleep(0.5) # Giả lập độ trễ mạng/xử lý
        return f"(Dịch sang {target_lang}): {text}"

manager = ConnectionManager()

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id, client_id)
    try:
        while True:
            # Nhận dữ liệu thô (JSON string)
            raw_data = await websocket.receive_text()
            
            try:
                data = json.loads(raw_data)
                cmd = data.get("cmd")

                if cmd == "config":
                    # User gửi lệnh cấu hình (VD: Bật dịch)
                    # { "cmd": "config", "translate_mode": true, "target_lang": "vi" }
                    await manager.update_config(room_id, client_id, {
                        "translate_mode": data.get("translate_mode"),
                        "target_lang": data.get("target_lang")
                    })
                    await websocket.send_text(json.dumps({"status": "config_updated"}))
                
                elif cmd == "message":
                    # User gửi tin nhắn/audio để chat
                    # { "cmd": "message", "type": "text", "content": "Hello" }
                    await manager.process_and_route(room_id, client_id, data)
                
                else:
                    print(f"Unknown command: {cmd}")

            except json.JSONDecodeError:
                await websocket.send_text("Invalid JSON format")

    except WebSocketDisconnect:
        manager.disconnect(room_id, client_id)
        # Thông báo cho phòng là ai đó đã thoát
        await manager.broadcast(f"Client {client_id} left", room_id)
