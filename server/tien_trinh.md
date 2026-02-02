# Tiến Trình Phát Triển Server (tien_trinh.md)

Tài liệu ghi lại trạng thái hiện tại của Backend Server Translator ProMax.

## ✅ Đã hoàn thành (Done)

1.  **Thiết kế cấu trúc Server (Skeleton)**
    -   Sử dụng **FastAPI** làm core framework.
    -   Tổ chức thư mục theo chuẩn modular: `app/core`, `app/api`, `app/schemas`.
    -   Tích hợp đầy đủ Swagger UI (/docs) để test API.

2.  **Xác thực (Authentication)**
    -   Tích hợp **Supabase Auth** (Login/Register).
    -   Sử dụng thư viện `supabase-py` và fix lỗi import `gotrue`.
    -   API: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`.
    -   Logic: Đăng ký user -> Insert vào bảng `profiles` (Giả lập logic, khuyến khích dùng Trigger DB).

3.  **Quản lý Phòng (Rooms)**
    -   Lưu trữ phòng trong **RAM (In-memory)** để tối ưu tốc độ.
    -   Cơ chế **Auto-cleanup**: Tự động xoá phòng sau **30 phút** không hoạt động để giải phóng RAM.
    -   API: `POST /api/v1/rooms/create`, `POST /api/v1/rooms/join`.

4.  **Luồng Streaming & Dịch (Logic Quan Trọng)**
    -   Xây dựng `ConnectionManager` trong `stream.py`.
    -   Cơ chế **Hub-and-Spoke**: Server nhận dữ liệu từ A -> Routing -> Gửi cho B.
    -   **Config theo User**: Mỗi user có quyền bật/tắt chế độ dịch (`translate_mode`) riêng biệt.
    -   Mô phỏng luồng gọi **Colab**: Nếu user bật dịch, server sẽ giả lập gửi sang Colab và trả về kết quả dịch.

## 🚧 Chưa hoàn thành / Cần làm tiếp (To Do)

1.  **Tích hợp Colab thực tế**
    -   Hiện tại hàm `mock_colab_translate` trong `stream.py` chỉ là giả lập.
    -   Cần viết code để gửi HTTP Request (hoặc Socket) thật sang URL của Colab đang chạy model AI.

2.  **Xử lý Audio/Video Binary**
    -   WebSocket hiện tại đang demo chủ yếu với Text (JSON).
    -   Cần bổ sung xử lý nhận `bytes` (Audio Blobs) từ Micro của Client -> Gửi sang Colab.

3.  **Supabase Database Triggers**
    -   Trong phần Register, backend đang cố gắng insert vào bảng `profiles`.
    -   **Khuyến nghị**: Nên viết một Function & Trigger trong SQL của Supabase để tự động tạo profile khi có user mới (`auth.users`), giúp code backend gọn và an toàn hơn.

4.  **Bảo mật & Production**
    -   Cần thay thế `origins=["*"]` trong CORS bằng domain thật của Frontend.
    -   Cấu hình biến môi trường (`.env`) thay vì hardcode key trong `config.py` (Mặc dù file config đã tách biệt nhưng nên dùng file .env thật).

## 📝 Lưu ý quan trọng (Notes)

*   **Logic Dịch**: Logic hiện tại là "Người Nhận Yêu Cầu Dịch". Tức là nếu A nói tiếng Việt, B muốn nghe tiếng Anh, thì **MÁY CỦA B** (hoặc config của B trên server) sẽ quyết định việc gọi Colab dịch sang tiếng Anh. Người A không cần quan tâm B nghe tiếng gì.
*   **Supabase Library**: Đang dùng bản `supabase` python client. Nếu gặp lỗi version, hãy check file `requirements.txt` và đảm bảo cài đúng version tương thích.
*   **In-memory Rooms**: Vì lưu trong RAM, nếu restart server thì **tất cả phòng sẽ mất**. Đây là đặc tính thiết kế (stateless persistence) phù hợp cho video call nhanh, nhưng cần lưu ý nếu muốn triển khai hệ thống lớn hơn (lúc đó nên dùng Redis).

---
*Cập nhật lần cuối: 02/02/2026*
