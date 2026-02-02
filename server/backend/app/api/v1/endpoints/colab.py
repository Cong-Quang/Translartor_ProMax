from fastapi import APIRouter

router = APIRouter()

@router.post("/receive-processed-data")
async def receive_from_colab(data: dict):
    """
    Nhận dữ liệu đã xử lý từ Colab (ví dụ: kết quả nhận diện, dịch).
    """
    # Logic xử lý: Forward kết quả này vào phòng tương ứng qua WebSocket
    return {"status": "received", "data_length": len(data)}

@router.get("/status")
async def check_colab_status():
    """
    Kiểm tra trạng thái kết nối với Colab.
    """
    return {"status": "waiting_for_connection"}
