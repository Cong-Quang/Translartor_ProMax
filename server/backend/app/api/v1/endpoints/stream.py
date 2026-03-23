from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict
import json
import asyncio
import httpx
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

# ─────────────────────────────────────────────────
# MyMemory Translation API
# ─────────────────────────────────────────────────
MYMEMORY_URL = "https://api.mymemory.translated.net/get"

async def translate_text(text: str, src_lang: str, target_lang: str) -> str:
    """
    Gọi MyMemory API để dịch văn bản.
    Trả về bản dịch, hoặc text gốc nếu lỗi.
    """
    if not text or not text.strip():
        return text

    # MyMemory dùng format "en|vi"
    langpair = f"{src_lang}|{target_lang}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(MYMEMORY_URL, params={
                "q": text,
                "langpair": langpair,
            })
            data = resp.json()
            translated = data.get("responseData", {}).get("translatedText", "")
            if translated and data.get("responseStatus") == 200:
                return translated
            # Fallback: ghép các match nếu có
            matches = data.get("matches", [])
            if matches:
                return matches[0].get("translation", text)
            return text
    except Exception as e:
        logger.error(f"[MyMemory] Translation error: {e}")
        return text


# ─────────────────────────────────────────────────
# Connection Manager
# ─────────────────────────────────────────────────
class ConnectionManager:
    """
    Quản lý kết nối WebSocket tập trung.
    """
    def __init__(self):
        # { "room_id": { "users": { "client_id": { "ws": ws, "config": {...} } } } }
        self.rooms: Dict[str, Dict[str, any]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = {"users": {}}

        # Lấy danh sách existing users TRƯỚC khi thêm user mới
        existing_user_ids = list(self.rooms[room_id]["users"].keys())

        # Thêm user mới
        self.rooms[room_id]["users"][client_id] = {
            "ws": websocket,
            "config": {
                "translate_mode": False,
                "target_lang": "vi",
                "src_lang": "auto"
            }
        }
        logger.info(f"🟢 USER {client_id} joined Room {room_id} (existing: {existing_user_ids})")

        # 1. Gửi room-info cho user mới → biết ai đang trong phòng
        try:
            await websocket.send_text(json.dumps({
                "type": "room-info",
                "existing_users": existing_user_ids
            }))
        except Exception as e:
            logger.error(f"Failed to send room-info: {e}")

        # 2. Broadcast user-joined cho tất cả người cũ
        await self._broadcast_to_room(room_id, {
            "type": "user-joined",
            "user_id": client_id
        }, exclude=client_id)

    def disconnect(self, room_id: str, client_id: str):
        if room_id not in self.rooms:
            return
        if client_id in self.rooms[room_id]["users"]:
            del self.rooms[room_id]["users"][client_id]
        logger.info(f"🔴 USER {client_id} left Room {room_id}")

        # Broadcast user-left
        asyncio.create_task(self._broadcast_to_room(room_id, {
            "type": "user-left",
            "user_id": client_id
        }))

        # Dọn phòng trống
        if not self.rooms[room_id]["users"]:
            del self.rooms[room_id]

    async def _broadcast_to_room(self, room_id: str, message: dict, exclude: str = None):
        """Gửi message đến tất cả users trong phòng (trừ exclude)."""
        if room_id not in self.rooms:
            return
        text = json.dumps(message)
        dead = []
        for uid, u_info in self.rooms[room_id]["users"].items():
            if uid == exclude:
                continue
            try:
                await u_info["ws"].send_text(text)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self.rooms[room_id]["users"].pop(uid, None)

    async def update_user_config(self, room_id: str, client_id: str, config: dict):
        if room_id in self.rooms and client_id in self.rooms[room_id]["users"]:
            self.rooms[room_id]["users"][client_id]["config"].update(config)
            logger.info(f"⚙️ Config updated for {client_id}: {config}")

    async def broadcast_message(self, room_id: str, sender_id: str, message: str):
        """Broadcast tin nhắn chat cho tất cả (trừ sender)."""
        await self._broadcast_to_room(room_id, {
            "type": "message",
            "user_id": sender_id,
            "message": message
        }, exclude=sender_id)

    async def broadcast_device_toggle(self, room_id: str, sender_id: str, kind: str, value: bool):
        """Broadcast trạng thái mic/cam cho tất cả (trừ sender)."""
        await self._broadcast_to_room(room_id, {
            "type": "device-toggle",
            "user_id": sender_id,
            "kind": kind,
            "value": value
        }, exclude=sender_id)

    async def handle_translate_message(self, room_id: str, sender_id: str, content: str, msg_type: str):
        """
        Dịch và gửi nội dung đến từng user trong phòng.
        - Nếu user đích bật translate_mode → gọi MyMemory API rồi gửi bản dịch
        - Nếu không → gửi thẳng nội dung gốc
        """
        if room_id not in self.rooms:
            return

        users = self.rooms[room_id]["users"]
        sender_info = users.get(sender_id, {})
        src_lang = sender_info.get("config", {}).get("src_lang", "auto")

        # Nếu src_lang là "auto", dùng "en" cho MyMemory
        effective_src = src_lang if src_lang != "auto" else "en"

        for uid, u_info in users.items():
            if uid == sender_id:
                continue

            config = u_info["config"]
            target_ws = u_info["ws"]

            if config.get("translate_mode"):
                target_lang = config.get("target_lang", "vi")
                try:
                    translated = await translate_text(content, effective_src, target_lang)
                    payload = {
                        "type": "translated",
                        "sender_id": sender_id,
                        "content": translated,
                        "original_content": content
                    }
                    logger.info(f"🌐 Translated '{content}' → '{translated}' ({effective_src}→{target_lang})")
                except Exception as e:
                    logger.error(f"Translation failed: {e}")
                    payload = {
                        "type": "original",
                        "sender_id": sender_id,
                        "content": content,
                        "content_type": msg_type
                    }
            else:
                payload = {
                    "type": "original",
                    "sender_id": sender_id,
                    "content": content,
                    "content_type": msg_type
                }

            try:
                await target_ws.send_text(json.dumps(payload))
            except Exception:
                pass


manager = ConnectionManager()


# ─────────────────────────────────────────────────
# WebSocket Endpoint
# ─────────────────────────────────────────────────
@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    client_id: str,
):
    try:
        await manager.connect(websocket, room_id, client_id)
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
                msg_type = data.get("type")
                cmd = data.get("cmd")

                if msg_type == "config" or cmd == "config":
                    # Cập nhật cài đặt dịch thuật của user
                    await manager.update_user_config(room_id, client_id, {
                        "translate_mode": data.get("translate_mode", False),
                        "target_lang": data.get("target_lang", "vi"),
                        "src_lang": data.get("src_lang", "auto")
                    })

                elif msg_type == "message":
                    # Chat message: broadcast cho tất cả
                    await manager.broadcast_message(room_id, client_id, data.get("message", ""))

                elif msg_type == "device-toggle":
                    # Mic/cam status: broadcast cho tất cả
                    await manager.broadcast_device_toggle(
                        room_id, client_id,
                        data.get("kind", ""),
                        data.get("value", False)
                    )

                elif msg_type == "translate-text":
                    # Dịch text caption/speech rồi gửi cho người khác
                    await manager.handle_translate_message(
                        room_id, client_id,
                        data.get("content", ""),
                        "text"
                    )

            except json.JSONDecodeError:
                logger.warning("Received invalid JSON")

    except WebSocketDisconnect:
        manager.disconnect(room_id, client_id)
    except Exception as e:
        logger.error(f"❌ WebSocket Error: {e}")
        manager.disconnect(room_id, client_id)
        try:
            await websocket.close()
        except:
            pass
