# Chi Tiết Hệ Thống Server Translator ProMax (`chitiet.md`)

Tài liệu tổng hợp toàn bộ hiện trạng hệ thống, kiến trúc và các yêu cầu kỹ thuật để vận hành.

## 1. Tổng Quan Kiến Trúc (Architecture)

Hệ thống hoạt động theo mô hình **Hub-and-Spoke** với Server là trung tâm điều phối.

-   **Server (FastAPI)**: Đóng vai trò Hub, quản lý kết nối WebSocket, Room, và Routing tin nhắn.
-   **User Client (Web/Mobile)**: 
    -   Xử lý STT (Speech-to-Text) và TTS (Text-to-Speech) tại client.
    -   Kết nối vào Server để gửi **Text** và nhận **Text đã dịch**.
-   **Colab Client (AI Worker)**: Kết nối vào Server để nhận task dịch thuật (Text-to-Text).

## 2. Các Chức Năng Đã Hoàn Thành (Implemented Features)

### A. Xác Thực (Authentication)
-   **Công nghệ**: Supabase Auth.
-   **API**:
    -   `POST /api/v1/auth/login`: Đăng nhập lấy Token.
    -   `POST /api/v1/auth/register`: Đăng ký tài khoản mới & tạo profile.

### B. Quản Lý Phòng (Room Management)
-   **Cơ chế**: In-memory (Lưu trong RAM để tối ưu tốc độ).
-   **Tính năng**:
    -   Tạo phòng (`/create`), Tham gia phòng (`/join`).
    -   **Auto-Cleanup**: Tự động xoá phòng sau 30 phút không có hoạt động.

### C. Streaming & Thông Dịch (Core Logic)
-   **Giao thức**: WebSocket (`ws://domain/ws/{room_id}/{client_id}?role={user|colab}`).
-   **Routing Logic**:
    1.  User gửi tin nhắn.
    2.  Server lấy `config` của người gửi để biết `src_lang` (Ngôn ngữ nguồn).
    3.  Server kiểm tra người nhận. Nếu người nhận cần dịch:
        -   Gói tin gửi sang Colab có đủ: `src_lang` (Nguồn) và `target_lang` (Đích).
    4.  Nếu không => Gửi thẳng.

### D. Auto-Tunneling (Mới)
-   **Công nghệ**: `pyngrok`.
-   **Tính năng**: Tự động mở Tunnel 3001 nếu có `NGROK_TOKEN` trong biến môi trường.

## 3. Yêu Cầu Kỹ Thuật & Tích Hợp (Requirements)

### A. Database (Supabase)
Chạy SQL tạo bảng `profiles` như cũ.

### B. Colab Client Script (Python)
Script chạy trên Colab cần xử lý JSON format sau:
```json
{
  "task": "translate",
  "content": "Hello World",
  "src_lang": "en",           // <-- Ngôn ngữ của người nói
  "target_lang": "vi",        // <-- Ngôn ngữ người nghe muốn nhận
  "target_user_id": "...",
  "sender_id": "..."
}
```
Colab dùng `src_lang` và `target_lang` để cấu hình model dịch cho chính xác.

### C. Frontend Client
1.  **Cấu hình**: Gửi JSON command để set ngôn ngữ của mình:
    ```json
    { 
      "cmd": "config", 
      "translate_mode": true, 
      "target_lang": "vi",   // Mình muốn nghe tiếng Việt
      "src_lang": "en"       // Mình nói tiếng Anh
    }
    ```

---
*Tài liệu được sinh ra tự động bởi hệ thống phát triển.*
