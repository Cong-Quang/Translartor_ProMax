from pydantic import BaseModel
from typing import Optional

class RoomCreate(BaseModel):
    """
    Schema để tạo phòng mới.
    """
    room_name: str
    host_id: str

class RoomJoin(BaseModel):
    """
    Schema để tham gia phòng.
    """
    room_id: str
    user_id: str

class RoomInfo(BaseModel):
    """
    Thông tin chi tiết về phòng.
    """
    room_id: str
    room_name: str
    host_id: str
    created_at: float # Timestamp
    is_active: bool
