from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Store connections as {room_id: {user_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # AI Worker Management
        self.worker_connection: WebSocket = None

    async def connect_worker(self, websocket: WebSocket):
        await websocket.accept()
        self.worker_connection = websocket
        print("AI Worker Connected")

    def disconnect_worker(self):
        self.worker_connection = None
        print("AI Worker Disconnected")

    async def send_to_worker(self, message: str):
        if self.worker_connection:
            try:
                await self.worker_connection.send_text(message)
                return True
            except Exception:
                self.disconnect_worker()
                return False
        return False

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room_id: str, exclude_user: str = None):
        if room_id in self.active_connections:
            for user_id, connection in self.active_connections[room_id].items():
                if user_id != exclude_user:
                    try:
                        await connection.send_text(message)
                    except Exception:
                        pass  # Handle failed sends appropriately in production

manager = ConnectionManager()
