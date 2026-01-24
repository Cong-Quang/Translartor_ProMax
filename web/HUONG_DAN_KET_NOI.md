# 📘 Tài Liệu Tích Hợp Web Client (Translator ProMax)

Tài liệu dành cho Developer phát triển giao diện Web, mô tả cách kết nối tới **Media Server** để thực hiện Livestream (Voice/Video) và điều khiển dịch thuật.

## 🔗 Thông Tin Kết Nối
- **Server URL**: `http://xomnhala.ddns.net:3000`
- **Protocol**: Socket.IO (Signaling) + WebRTC (Media Transport).
- **Yêu cầu**: Web phải chạy `https` hoặc `localhost` để quyền truy cập Mic/Cam hoạt động.

---

## 📦 1. Cài Đặt
Cài đặt các gói npm cần thiết:
```bash
npm install socket.io-client mediasoup-client
```

---

## 🛠 2. Quy Trình Tích Hợp

### A. Kết Nối Server
```javascript
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";

const socket = io("http://xomnhala.ddns.net:3000");
let device;

socket.on("connect", () => {
    console.log("✅ Đã kết nối Signaling Server");
    initMediasoup(); // Khởi tạo Mediasoup ngay khi kết nối
});
```

### B. Chọn Ngôn Ngữ Dịch (Signaling)
Gửi sự kiện để báo cho Server/AI biết ngôn ngữ nguồn và đích.
```javascript
function setLanguage(source, target) {
    // Ví dụ: source='vi', target='en'
    socket.emit('signal', {
        type: 'SET_LANGUAGE',
        payload: {
            sourceLang: source,
            targetLang: target
        }
    });
}
```

### C. Bật Mic/Cam (Streaming)
Quá trình này yêu cầu khởi tạo `Device` và tạo `Transport`.

#### Bước 1: Khởi tạo Device
```javascript
async function initMediasoup() {
    device = new Device();

    // Lấy RTP Capabilities từ Server
    socket.emit("getRouterRtpCapabilities", async ({ rtpCapabilities }) => {
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        console.log("✅ Device Ready");
    });
}
```

#### Bước 2: Bắt đầu Streaming
```javascript
let sendTransport;

async function startStream() {
    // 1. Tạo Transport gửi lên Server
    socket.emit("createWebRtcTransport", async ({ params }) => {
        if (params.error) return console.error(params.error);

        sendTransport = device.createSendTransport(params);

        // Xử lý sự kiện kết nối của Transport
        sendTransport.on("connect", ({ dtlsParameters }, cb, errback) => {
            socket.emit("connectTransport", { transportId: sendTransport.id, dtlsParameters }, cb);
        });

        sendTransport.on("produce", async ({ kind, rtpParameters }, cb, errback) => {
            socket.emit("produce", { transportId: sendTransport.id, kind, rtpParameters }, ({ id }) => cb({ id }));
        });

        // 2. Lấy Stream từ Mic/Cam
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); // Chỉ lấy Audio
        const audioTrack = stream.getAudioTracks()[0];

        // 3. Đẩy Stream lên Server
        const producer = await sendTransport.produce({ track: audioTrack });
        console.log("🎙️ Đang gửi âm thanh sang Server dịch thuật...");
    });
}
```

### D. Ngắt Kết Nối (Stop)
```javascript
function stopStream() {
    if (sendTransport) {
        sendTransport.close(); // Đóng transport client
        // Có thể gửi thêm signal báo server nếu cần
    }
}
```

---

## 💡 Lưu ý Debug
1. **Lỗi `Device.load()`**: Thường do version `mediasoup-client` không khớp hoặc server chưa gửi đúng RTP Capabilities.
2. **Lỗi `getUserMedia`**: Kiểm tra quyền truy cập Mic trên trình duyệt.
3. **Firewall**: Nếu kết nối từ 4G/Wifi khác, đảm bảo Router tại server đã mở Port UDP `40000-49999`.
