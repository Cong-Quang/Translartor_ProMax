# 🌐 Hướng Dẫn Kết Nối & Sử Dụng (Client Web)

Tài liệu này hướng dẫn cách tích hợp **Mediasoup Client** để kết nối tới Gateway Server và thực hiện chuyển tiếp âm thanh/hình ảnh.

## 1. Cài đặt Thư viện
Bạn cần 2 thư viện chính:
```bash
npm install socket.io-client mediasoup-client
```
*Hoặc dùng CDN trong thẻ `<script>`:*
```html
<script src="/socket.io/socket.io.js"></script> <!-- Lấy từ server -->
<!-- mediasoup-client cần bundle hoặc import map, khuyến nghị dùng npm + bundler (Vite/Webpack) -->
```

## 2. Thông Tin Server
- **URL Socket**: `http://xomnhala.ddns.net:3000`
- **Transport Protocol**: UDP (cho Media), TCP/WebSocket (cho Signaling).

## 3. Luồng Kết Nối (Workflow)

### B1: Khởi tạo & Kết nối Socket
```javascript
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";

const socket = io("http://xomnhala.ddns.net:3000");

socket.on("connect", () => {
    console.log("Connected to Signaling Server:", socket.id);
    initMediasoup();
});
```

### B2: Khởi tạo Mediasoup Device
```javascript
let device;
let sendTransport;
let recvTransport;

async function initMediasoup() {
    device = new Device();

    // 1. Lấy RTP Capabilities từ Server
    socket.emit("getRouterRtpCapabilities", async ({ rtpCapabilities }) => {
        // 2. Load capabilities vào Device
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        console.log("Device Loaded:", device.handlerName);
        
        // 3. Tạo Transport để gửi (Produce) hoặc nhận (Consume)
        createSendTransport();
    });
}
```

### B3: Tạo Transport Gửi (Send Transport)
```javascript
function createSendTransport() {
    socket.emit("createWebRtcTransport", async ({ params }) => {
        if (params.error) return console.error(params.error);

        // Tạo transport ở client dựa trên params từ server
        sendTransport = device.createSendTransport(params);

        // Xử lý sự kiện "connect" (DTLS handshake)
        sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit("connectTransport", { 
                transportId: sendTransport.id, 
                dtlsParameters 
            }, callback);
        });

        // Xử lý sự kiện "produce" (Gửi media lên server)
        sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
            socket.emit("produce", { 
                transportId: sendTransport.id, 
                kind, 
                rtpParameters 
            }, (response) => {
                callback({ id: response.id });
            });
        });
    });
}
```

### B4: Bắt đầu Streaming (Mở Mic/Cam)
```javascript
async function startPublishing() {
    // Lấy stream từ browser
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    
    // Lấy track audio/video
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    // Gửi lên server (Produce)
    const audioProducer = await sendTransport.produce({ track: audioTrack });
    const videoProducer = await sendTransport.produce({ track: videoTrack });

    console.log("Đang phát stream!");
}
```

### B5: Nhận Stream (Dành cho AI/Người nghe)
*Luồng tương tự Send Transport, nhưng dùng `createRecvTransport` và gọi `consume`.*

---
## ⚠️ Lưu ý kỹ thuật
1. **SSL/HTTPS**: WebRTC yêu cầu trang web phải chạy trên **HTTPS** (hoặc `localhost`) để truy cập Mic/Cam. Nếu server `http://xomnhala.ddns.net` chưa có SSL, bạn có thể gặp lỗi trên Chrome.
2. **Firewall**: Đảm bảo dải port UDP `40000-49999` đã được mở (Port Forwarding) trên Router tại địa điểm đặt server.
