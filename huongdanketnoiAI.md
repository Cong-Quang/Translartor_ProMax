# Hướng Dẫn Kết Nối Google Colab AI Worker

Tài liệu này hướng dẫn cách sử dụng Google Colab (có GPU T4) để chạy "AI Worker", giúp xử lý các tác vụ nặng như Dịch thuật, Speech-to-Text (STT), Text-to-Speech (TTS) cho hệ thống Translator ProMax.

## 1. Chuẩn Bị
*   Một tài khoản Google để sử dụng Google Colab.
*   Backend Server đang chạy (hiện tại là `http://xomnhala.ddns.net:3001`).

## 2. Các Bước Thực Hiện Trên Google Colab

**Bước 1: Tạo Notebook mới**
Truy cập [Google Colab](https://colab.research.google.com/) và tạo một Notebook mới.

**Bước 2: Chọn Runtime có GPU**
*   Vào menu **Runtime** > **Change runtime type**.
*   Chọn **T4 GPU** (để xử lý AI nhanh hơn).

**Bước 3: Cài đặt thư viện cần thiết**
Chạy cell đầu tiên với lệnh sau để cài đặt thư viện kết nối WebSocket và fix lỗi async trên Colab:
```python
!pip install websockets nest_asyncio
```

**Bước 4: Chạy mã nguồn AI Worker**
Copy toàn bộ nội dung file `server/ai_worker_client.py` từ dự án vào một cell mới và chạy.

Hoặc bạn có thể dùng đoạn mã mẫu dưới đây (đã cấu hình sẵn):

```python
import asyncio
import websockets
import json
import time

# --- CẤU HÌNH ---
# Địa chỉ Server Backend của bạn
SERVER_URL = "ws://xomnhala.ddns.net:3001/ws/worker"
# Key bảo mật (phải khớp với AI_WORKER_KEY trong file config.py của server)
AI_WORKER_KEY = "change_this_to_a_secure_key" 

async def ai_worker():
    uri = f"{SERVER_URL}?key={AI_WORKER_KEY}"
    print(f"🔄 Đang kết nối tới {uri}...")
    
    while True:
        try:
            # Tăng ping_interval để tránh bị disconnect khi idle lâu
            async with websockets.connect(uri, ping_interval=20, ping_timeout=20) as websocket:
                print("✅ Đã kết nối thành công với Server!")
                print("🚀 AI Worker đang sẵn sàng xử lý lệnh...")
                
                while True:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        print(f"📩 Nhận lệnh từ User {data.get('user_id')} tại phòng {data.get('room_id')}")
                        
                        # --- KHU VỰC XỬ LÝ AI ---
                        # Tại đây bạn sẽ gọi các model AI (Whisper, Coqui TTS, NLLB...)
                        # Ví dụ giả lập xử lý:
                        
                        response_data = {
                            "type": "ai-response",
                            "room_id": data.get("room_id"),
                            "target_user_id": data.get("user_id"),
                            "message": f"🤖 AI Đã xử lý: {data.get('message', '')}"
                        }
                        
                        # Gửi kết quả lại cho Server
                        await websocket.send(json.dumps(response_data))
                        print(f"📤 Đã gửi kết quả về Server")
                        
                    except websockets.ConnectionClosed:
                        print("❌ Mất kết nối. Đang thử lại...")
                        break
                    except Exception as e:
                        print(f"⚠️ Lỗi xử lý tin nhắn: {e}")
                        
        except Exception as e:
            print(f"❌ Không thể kết nối: {e}. Thử lại sau 5s...")
            await asyncio.sleep(5)

# Chạy worker
if __name__ == "__main__":
    try:
        asyncio.run(ai_worker())
    except KeyboardInterrupt:
        print("Đã dừng Worker.")
```

## 3. Cách Kiểm Tra Hoạt Động

1.  Đảm bảo code trên Colab đang chạy và hiện thông báo: `✅ Đã kết nối thành công với Server!`.
2.  Mở Web App, tham gia một phòng họp.
3.  Khi Frontend gửi một yêu cầu AI (sau này sẽ tích hợp nút bấm), Colab sẽ nhận được, in log `📩 Nhận lệnh...` và gửi trả kết quả.

## 4. Lưu Ý Quan Trọng
*   **Keep Alive**: Google Colab sẽ ngắt kết nối nếu bạn đóng tab quá lâu. Hãy giữ tab Colab mở.
*   **Bảo Mật**: Hãy thay đổi `AI_WORKER_KEY` trong file `server/backend/app/core/config.py` và trong code Colab để tránh người lạ kết nối vào hệ thống của bạn.
