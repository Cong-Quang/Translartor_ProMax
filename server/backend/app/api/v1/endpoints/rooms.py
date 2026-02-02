from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.room import RoomCreate, RoomJoin, RoomInfo
import time
from typing import Dict

router = APIRouter()

# Lưu trữ phòng trong bộ nhớ tạm (In-memory)
# Format: { "room_id": { "data": RoomInfo, "last_activity": timestamp } }
active_rooms: Dict[str, dict] = {}

EXPIRATION_TIME = 30 * 60  # 30 phút

def cleanup_rooms():
    """
    Hàm dọn dẹp các phòng không hoạt động quá 30 phút.
    """
    current_time = time.time()
    expired_ids = []
    
    for room_id, info in active_rooms.items():
        if current_time - info["last_activity"] > EXPIRATION_TIME:
            expired_ids.append(room_id)
            
    for room_id in expired_ids:
        del active_rooms[room_id]
        print(f"Đã xoá phòng {room_id} do hết hạn.")

@router.post("/create", response_model=RoomInfo)
async def create_room(room_in: RoomCreate, background_tasks: BackgroundTasks):
    """
    Tạo phòng mới.
    
    - Lưu vào RAM server.
    - Setup thời gian tạo.
    """
    import uuid
    room_id = str(uuid.uuid4())
    
    new_room = RoomInfo(
        room_id=room_id,
        room_name=room_in.room_name,
        host_id=room_in.host_id,
        created_at=time.time(),
        is_active=True
    )
    
    active_rooms[room_id] = {
        "data": new_room,
        "last_activity": time.time()
    }
    
    # Chạy cleanup mỗi khi tạo phòng (hoặc dùng thư viện schedule chuyên nghiệp hơn)
    background_tasks.add_task(cleanup_rooms)
    
    return new_room

@router.post("/join", response_model=RoomInfo)
async def join_room(join_data: RoomJoin):
    """
    Tham gia phòng.
    
    - Kiểm tra phòng có tồn tại không.
    - Cập nhật last_activity để phòng không bị xoá.
    """
    room = active_rooms.get(join_data.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại hoặc đã bị xoá")
    
    # Cập nhật activity
    room["last_activity"] = time.time()
    
    return room["data"]
