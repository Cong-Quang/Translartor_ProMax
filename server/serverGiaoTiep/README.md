# Server Giao Tiếp (Media Server - Mediasoup)

## 📖 Giới thiệu
Đây là **Media Server** (đóng vai trò SFU - Selective Forwarding Unit) sử dụng thư viện **Mediasoup**.
Nhiệm vụ:
- Nhận luồng Audio/Video từ Browser (WebRTC).
- Chuyển tiếp luồng Audio sang AI Server (Colab) để xử lý dịch thuật.
- Định tuyến dữ liệu giữa các client.

## ⚠️ Yêu cầu quan trọng (Termux)
Mediasoup là thư viện C++ native, nên trên Termux cần cài đặt các công cụ biên dịch trước khi cài đặt `node_modules`.

**Lệnh cài đặt trên Termux:**
```bash
pkg install python build-essential make clang
npm install
```

## 🛠 Cấu hình
File cấu hình: `src/config.js`
- **Port:** 3000
- **Mediasoup Worker:** Tự động theo số nhân CPU.
- **Codecs:** Audio (Opus), Video (VP8).
- **Listen IP:** `0.0.0.0` (Cần chỉnh lại `announcedIp` trong config nếu chạy thật).

## 🚀 Cách chạy
```bash
npm start
```
Server sẽ khởi tạo Mediasoup Worker và lắng nghe tại Port 3000.

## 📡 Sự kiện Socket.IO
- `getRouterRtpCapabilities`: Lấy thông tin capabilities của server.
- `createWebRtcTransport`: Tạo kênh truyền.
- `connectTransport`: Kết nối DTLS.
- `produce`: Đẩy stream lên.
- `consume`: Nhận stream về.
- `signal`: (Legacy) Chuyển tiếp tin nhắn text đơn giản.
