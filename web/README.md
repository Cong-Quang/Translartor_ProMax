# Translator ProMax (Web Version)

Hệ thống họp trực tuyến thế hệ mới với khả năng dịch thuật thời gian thực và quản lý phòng họp thông minh.

## 🚀 Tính năng chính
- 📹 **Video Call P2P**: Kết nối trực tiếp, độ trễ thấp sử dụng WebRTC.
- 🎙️ **Dịch thuật Real-time**: Hỗ trợ chuyển đổi ngôn ngữ Anh - Việt tức thì bằng AI.
- 🎨 **Giao diện hiện đại**: Hỗ trợ Đa giao diện (Dark, Light, Ocean Blue) và Đa ngôn ngữ.
- 🔐 **Quản lý phòng họp**: Tạo phòng riêng tư với mật khẩu, lưu trữ dữ liệu qua Supabase.

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python (FastAPI), WebSockets.
- **Database**: Supabase (PostgreSQL).
- **Signaling**: WebRTC (SimplePeer/PeerJS).

## ⚠️ Lưu ý quan trọng
Để các tính năng liên quan đến phòng họp hoạt động, bạn cần cấu hình thông tin Supabase trong file `.env` tại thư mục `frontend/`. Xem chi tiết tại `Tutorial.md`.