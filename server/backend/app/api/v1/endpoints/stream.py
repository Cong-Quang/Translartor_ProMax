from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Optional
import json
import asyncio

router = APIRouter()

import logging

# Configure Logging
logger = logging.getLogger("uvicorn.error")

class ConnectionManager:
    """
    Quản lý kết nối WebSocket tập trung.
    Phân biệt giữa 'Client thường' (User) và 'Client Colab'.
    """
    def __init__(self):
        # { "room_id": { "users": { "client_id": ws }, "colab": ws } }
        self.rooms: Dict[str, Dict[str, any]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str, role: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = {"users": {}, "colab": None}
        
        if role == "colab":
            # Nếu là Colab -> Lưu vào slot colab
            logger.info(f"🔵 COLAB CONNECTED to Room {room_id}")
            self.rooms[room_id]["colab"] = websocket
            try:
                await websocket.send_text(json.dumps({"type": "welcome", "message": "Colab connected successfully"}))
            except:
                pass
        else:
            # Nếu là User -> Lưu vào danh sách users
            logger.info(f"🟢 USER {client_id} joined Room {room_id}")
            self.rooms[room_id]["users"][client_id] = {
                "ws": websocket,
                # Default config: src_lang='auto' (hoặc ngôn ngữ của user), target_lang='vi' (ngôn ngữ muốn nhận)
                "config": {"translate_mode": False, "target_lang": "vi", "src_lang": "auto"}
            }

    def disconnect(self, room_id: str, client_id: str, role: str):
        if room_id in self.rooms:
            if role == "colab":
                self.rooms[room_id]["colab"] = None
                logger.info(f"🔴 COLAB DISCONNECTED from Room {room_id}")
            else:
                if client_id in self.rooms[room_id]["users"]:
                    del self.rooms[room_id]["users"][client_id]
                logger.info(f"🔴 USER {client_id} left Room {room_id}")
            
            # Clean up empty rooms
            if not self.rooms[room_id]["users"] and not self.rooms[room_id]["colab"]:
                del self.rooms[room_id]

    async def update_user_config(self, room_id: str, client_id: str, config: dict):
        if room_id in self.rooms and client_id in self.rooms[room_id]["users"]:
            self.rooms[room_id]["users"][client_id]["config"].update(config)

    async def route_message(self, room_id: str, sender_id: str, data: dict):
        """
        Điều phối tin nhắn JSON.
        """
        if room_id not in self.rooms:
            return

        room_data = self.rooms[room_id]
        users = room_data["users"]
        colab_ws = room_data["colab"]

        sender_content = data.get("content")
        sender_type = data.get("type", "text") 
        
        # Lấy ngôn ngữ nguồn của người gửi
        sender_info = users.get(sender_id)
        src_lang = "auto"
        if sender_info:
            src_lang = sender_info["config"].get("src_lang", "auto")

        # --- LOGIC MỚI: Hỗ trợ Test 1 mình (Single User) ---
        # Nếu phòng chỉ có 1 người (là chính sender) và họ bật translate_mode
        # -> Gửi yêu cầu dịch cho chính họ để test.
        if len(users) == 1 and sender_info and sender_info["config"].get("translate_mode"):
            if colab_ws:
                payload = {
                    "task": "translate",
                    "sender_id": sender_id,
                    "target_user_id": sender_id, # Target chính mình
                    "content": sender_content,
                    "type": sender_type,
                    "src_lang": src_lang,
                    "target_lang": sender_info["config"].get("target_lang", "vi")
                }
                try:
                    await colab_ws.send_text(json.dumps(payload))
                except Exception:
                    pass
            # Vẫn trả về tin nhắn gốc (Echo)
            # await sender_info["ws"].send_text(json.dumps({
            #     "type": "original",
            #     "sender_id": sender_id,
            #     "content": sender_content,
            #     "content_type": sender_type
            # }))
            
        # Forward logic cho các recipients khác (nếu có)
        await self._dispatch_to_recipients(users, colab_ws, sender_id, sender_content, sender_type, src_lang)


    async def _dispatch_to_recipients(self, users, colab_ws, sender_id, content, msg_type, src_lang):
        for uid, u_info in users.items():
            if uid == sender_id: continue

            target_ws = u_info["ws"]
            config = u_info["config"]

            if config.get("translate_mode"):
                if colab_ws:
                    # Gửi cho Colab
                    payload = {
                        "task": "translate",
                        "sender_id": sender_id,
                        "target_user_id": uid,
                        "content": content,
                        "type": msg_type, # 'audio' hoặc 'text'
                        "src_lang": src_lang,             # Ngôn ngữ nguồn (của người gửi)
                        "target_lang": config.get("target_lang", "vi") # Ngôn ngữ đích (của người nhận)
                    }
                    try:
                        await colab_ws.send_text(json.dumps(payload))
                    except Exception:
                        pass
                else:
                    # Colab không online -> Báo lỗi cho sender
                    error_payload = {
                        "type": "error",
                        "content": "⚠️ AI Worker chưa kết nối. Tin nhắn chưa được dịch.",
                        "original_content": content
                    }
                    # Gửi lại cho người gửi để họ biết
                    sender_ws = users.get(sender_id, {}).get("ws")
                    if sender_ws:
                        try: 
                            await sender_ws.send_text(json.dumps(error_payload))
                        except: pass
                    
                    # Vẫn gửi tin nhắn gốc cho người nhận (fallback)
                    payload = {
                        "type": "original",
                        "sender_id": sender_id,
                        "content": content,
                        "content_type": msg_type
                    }
                    await target_ws.send_text(json.dumps(payload))
            else:
                # Gửi thẳng (Nếu là audio, client nhận JSON chứa Base64 audio về tự decode)
                payload = {
                    "type": "original",
                    "sender_id": sender_id,
                    "content": content, # Text hoặc Base64 Audio
                    "content_type": msg_type
                }
                await target_ws.send_text(json.dumps(payload))


    async def route_from_colab(self, room_id: str, data: dict):
        """
        Nhận kết quả từ Colab -> Gửi cho User đích.
        """
        target_user_id = data.get("target_user_id")
        if room_id in self.rooms and target_user_id in self.rooms[room_id]["users"]:
            target_ws = self.rooms[room_id]["users"][target_user_id]["ws"]
            try:
                await target_ws.send_text(json.dumps({
                    "type": "translated",
                    "sender_id": data.get("sender_id"),
                    "content": data.get("translated_text"),
                    "original_content": data.get("original_content")
                }))
            except Exception as e:
                pass

manager = ConnectionManager()

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    room_id: str, 
    client_id: str, 
    role: str = Query("user", enum=["user", "colab"])
):
    try:
        await manager.connect(websocket, room_id, client_id, role)
        while True:
            # Chỉ nhận Text/JSON vì STT/TTS đã xử lý ở Client
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
                
                if role == "colab":
                    # Tin nhắn từ Colab -> Là kết quả dịch
                    await manager.route_from_colab(room_id, data)
                else:
                    # Tin nhắn từ User
                    cmd = data.get("cmd")
                    if cmd == "config":
                        await manager.update_user_config(room_id, client_id, {
                            "translate_mode": data.get("translate_mode"),
                            "target_lang": data.get("target_lang"),
                            "src_lang": data.get("src_lang", "auto")
                        })
                    elif cmd == "message":
                        # Chỉ route message text
                        await manager.route_message(room_id, client_id, data)

            except json.JSONDecodeError:
                logger.warning("Received invalid JSON")
                pass
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, client_id, role)
    except Exception as e:
        logger.error(f"❌ WebSocket Critical Error: {e}")
        try:
             await websocket.close()
        except:
            pass
