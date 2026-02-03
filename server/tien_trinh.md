# Tiến Trình Phát Triển Server (tien_trinh.md)

Tài liệu ghi lại trạng thái hiện tại của Backend Server Translator ProMax.

## ✅ Đã hoàn thành (Done)

1.  **Cấu trúc Server Skeleton**: FastAPI, Modular Design.
2.  **Auth (Xác thực)**: Supabase Integration (Login/Register).
3.  **Rooms (Quản lý phòng)**: In-memory, Auto-cleanup.
4.  **Streaming & Dịch thuật**:
    -   Kiến trúc: Hub-and-Spoke.
    -   **Text Handling Only**: Server chỉ nhận Text từ Client (do Client tự lo STT/TTS).
    -   Colab Client: Nhận Text -> Dịch Text -> Trả Text.

5.  **Auto-Tunneling**: Tự động tạo Ngrok Tunnel nếu có Key.

## 🚧 Điều cần làm phía Client & Colab

1.  **Colab Script**:
    -   Chạy model Text translation (nhẹ hơn nhiều so với việc phải gánh cả Audio Whisper).
2.  **Frontend**:
    -   Tích hợp STT/TTS (WebSpeech API).
    -   Gửi Text qua socket.

---
*Cập nhật lần cuối: 03/02/2026*
