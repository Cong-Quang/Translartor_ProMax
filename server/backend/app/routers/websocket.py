
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.connection_manager import manager
import json

router = APIRouter()

@router.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(websocket, room_id, user_id)
    try:
        # Notify others in the room clearly
        await manager.broadcast(json.dumps({
            "type": "user-joined",
            "user_id": user_id,
            "message": f"User {user_id} joined the room"
        }), room_id, exclude_user=user_id)
        
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                
                # Check if this is a request for AI processing
                if message_data.get("target") == "ai-worker":
                     # Forward to AI worker
                     message_data["user_id"] = user_id
                     message_data["room_id"] = room_id
                     success = await manager.send_to_worker(json.dumps(message_data))
                     if not success:
                         # Notify user if worker is offline
                         await manager.send_personal_message(json.dumps({
                             "type": "error",
                             "message": "AI System is currently offline."
                         }), websocket)
                     continue

                # Normal Chat/Signal Broadcast
                # Ensure the message has the user_id attached if not present
                if "user_id" not in message_data:
                    message_data["user_id"] = user_id
                
                # Broadcast back to room
                await manager.broadcast(json.dumps(message_data), room_id, exclude_user=user_id)
            except json.JSONDecodeError:
                # Fallback for plain text
                await manager.broadcast(json.dumps({
                    "type": "message",
                    "user_id": user_id,
                    "message": data
                }), room_id, exclude_user=user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        await manager.broadcast(json.dumps({
            "type": "user-left",
            "user_id": user_id,
            "message": f"User {user_id} left the room"
        }), room_id)

@router.websocket("/ws/worker")
async def worker_endpoint(websocket: WebSocket, key: str = None):
    from app.core.config import get_settings
    settings = get_settings()
    
    if key != settings.AI_WORKER_KEY:
        await websocket.close(code=1008)
        return

    await manager.connect_worker(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                # Worker should send back { "room_id": "...", "type": "ai-response", ... }
                room_id = message_data.get("room_id")
                if room_id:
                    # Broadcast AI response to the room
                    await manager.broadcast(json.dumps(message_data), room_id)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect_worker()
