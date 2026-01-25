
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.connection_manager import manager
import json

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple echo/broadcast logic for now, can be expanded for specific signaling
            # Try to parse as JSON for signaling
            try:
                message_data = json.loads(data)
                # Handle specific signal types here if needed
                # For now, just broadcast to others or echo
                await manager.broadcast(f"Message text was: {data}")
            except json.JSONDecodeError:
                await manager.broadcast(f"Message text was: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("Client #left")
