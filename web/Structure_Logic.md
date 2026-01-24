# Cấu trúc & Logic - Translartor ProMax

## 1. Tổng quan Dự án
Đây là ứng dụng Web Họp trực tuyến hiệu năng cao, tập trung vào sự dễ dàng khi triển khai, giao diện "Premium", và phân chia cấu trúc rõ ràng.

## 2. Cấu trúc Thư mục (`web/`)

### `web/run.bat`
- **Vai trò**: Điểm khởi chạy tự động.
- **Logic**:
  1. Kiểm tra Node.js và Python 3.12 đã cài đặt chưa.
  2. Thiết lập môi trường ảo Python (`backend/venv`).
  3. Cài đặt các thư viện Backend (`fastapi`, `uvicorn`, `websockets`).
  4. Cài đặt các thư viện Frontend (`npm install`).
  5. Sử dụng `concurrently` để chạy cả hai server trong **một cửa sổ terminal** duy nhất để dễ quản lý.
  6. Tự động mở trình duyệt vào địa chỉ frontend.

### `web/frontend/` (Vite + React + TS)
- **Framework**: React 19, Vite, TypeScript.
- **Giao diện (Styling)**: Tailwind CSS v3 (Ổn định) với giao diện "Premium Dark" tùy chỉnh trong `tailwind.config.js` và `src/index.css`.
- **Các File Quan trọng**:
    - **`src/config.ts`**: Cấu hình trung tâm cho API URL, màu sắc chủ đạo, và tài khoản Admin.
    - **`src/App.tsx`**: Router chính sử dụng `react-router-dom`. Chứa logic cho các trang giữ chỗ (placeholders).
    - **`src/layouts/Layout.tsx`**: Khung ứng dụng chính. Triển khai **Thanh điều hướng đỉnh** (Horizontal Navbar) và menu mobile.
    - **`src/pages/Home.tsx`**: Trang chủ với thiết kế tương phản cao, không animation để đảm bảo độ rõ nét tối đa.

### `web/backend/` (FastAPI)
- **Framework**: FastAPI (Python).
- **Vai trò**:
    - **API Server**: Xử lý các request REST (hiện tại là khung sườn).
    - **WebSocket Server**: Endpoint `ws://localhost:8000/ws` sẵn sàng cho việc truyền tin thời gian thực (signaling).
- **Các File Quan trọng**:
    - **`main.py`**: Điểm khởi chạy ứng dụng.

## 3. Thư viện & Công nghệ
- **UI/UX**: `lucide-react` (Icons), Tailwind CSS (Thiết kế hệ thống).
- **WebRTC**:
    - `peerjs`: Wrapper hiện đại cho WebRTC để kết nối P2P.
    - `simplewebrtc`: Đã cài đặt để đảm bảo tương thích/hỗ trợ legacy như yêu cầu.
- **Routing**: `react-router-dom` v7.

## 4. Luồng Logic (Logic Flow)
1. **Khởi động**: `run.bat` khởi tạo môi trường -> khởi chạy Backend (cổng 8000) & Frontend (cổng 5173).
2. **Điều hướng**: Người dùng truy cập `localhost:5173`. `App.tsx` điều hướng vào `Layout` -> `Home`.
3. **Thanh điều hướng**: `Layout` duy trì trạng thái của Navbar và xử lý chuyển trang (`/meeting-new`, `/settings`, v.v.).
4. **Cuộc họp**: (Tương lai) `PeerJS` sẽ kết nối tới Broker server được định nghĩa trong `config.ts` để thiết lập luồng video/audio P2P.
