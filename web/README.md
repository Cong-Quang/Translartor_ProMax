# 🌐 Web Client - Translator ProMax

##  Tổng quan
Module Web Client cho hệ thống Translator ProMax. Đây là giao diện người dùng trên trình duyệt, đóng vai trò tương tự như Android App trong sơ đồ tổng thể: kết nối với Local AI Server qua WebSocket để thu âm, gửi dữ liệu và nhận kết quả dịch thuật (Realtime Translation).

##  Những việc cần làm (Tasks)

### 1. Khởi tạo & Cấu hình
- [ ] Khởi tạo dự án Web (Khuyên dùng **Vite + React** hoặc **Next.js**).
- [ ] Thiết lập cấu trúc thư mục chuẩn (`src/components`, `src/hooks`, `src/services`, `src/assets`).
- [ ] Cài đặt các thư viện cần thiết:
    - WebSocket (native hoặc `socket.io-client`).
    - UI Framework (TailwindCSS, Ant Design, hoặc Material UI...).
    - Audio Handling (`recordrtc`, `audio-worklet`...).

### 2. Phát triển tính năng (Features)
- [ ] **Kết nối Server**:
    - Giao diện nhập IP/Port của Local AI Server.
    - Hiển thị trạng thái kết nối (Connected/Disconnected).
- [ ] **Xử lý Âm thanh (Audio)**:
    - Xin quyền truy cập Microphone.
    - Thu âm và cắt nhỏ (chunking) audio (2s - 5s) gửi qua WebSocket.
    - (Nâng cao) Tích hợp VAD (Voice Activity Detection) để chỉ gửi khi có tiếng nói.
- [ ] **Hiển thị & Tương tác**:
    - Hiển thị phụ đề (Subtitle) gốc và văn bản dịch thời gian thực.
    - Hiển thị danh sách các user/room đang tham gia (nếu có).
    - Nút chức năng: Bắt đầu/Dừng thu âm, Bật/Tắt TTS (Text-to-Speech).
- [ ] **Nhận phản hồi (Response)**:
    - Xử lý text trả về để hiển thị.
    - Phát audio (TTS) nếu server trả về dữ liệu âm thanh.

### 3. Kiểm thử & Tối ưu
- [ ] Test độ trễ (Latency) giữa việc nói và hiển thị chữ.
- [ ] Đảm bảo giao diện Responsive (dùng tốt trên cả Laptop & Mobile Browser).

##  Yêu cầu Kỹ thuật (Requirements)
- **Node.js**: Phiên bản LTS (v18.x trở lên).
- **Package Manager**: npm, yarn hoặc pnpm.
- **Kiến thức**: HTML5, CSS3, JavaScript/TypeScript (ES6+), ReactJS.
- **Browser**: Chrome, Edge (Hỗ trợ AudioWorklet & WebSocket).

##  Các bước thực hiện (Steps)
1. **Clone Repository**:
   ```bash
   git clone <link-repo>
   ```
2. **Chuyển sang nhánh Web**:
   ```bash
   git checkout web
   # Hoặc nếu chưa có nhánh web: git checkout -b web
   ```
3. **Di chuyển vào thư mục web**:
   ```bash
   cd web
   ```
4. **Khởi tạo dự án** (Nếu chưa có):
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```
5. **Code**: Thực hiện các task đã liệt kê.
6. **Chạy thử**: `npm run dev`.

##  Thành viên nhóm

| Nhóm | Họ và Tên | MSSV | GitHub Account | Gmail |
|:---:|:---:|:---:|:---:|:---:|
| 2 | Lê Huỳnh Ngọc | 2380601465 | @Lehuynh-Ngoc | quoclam2278@gmail.com |
| 2 | Nguyễn Phương Nam | 2380613311 | ... | nguyenphuongnam16112005@gmail.com |
| 3 | Trương Thị Yến Nhi | 2380601581 | @yennhitruong704-cloud | yennhitruong704@gmail.com |
| 3 | Ngô Nguyễn Thu Hương | 2380600942 | @NgoNguyenThuHuong | ngo24616@gmail.com |

*(Các thành viên vui lòng cập nhật thông tin chính xác của mình vào bảng trên)*

## ⚠️ QUY ĐỊNH GIT (BẮT BUỘC)

### 1. Nguyên tắc tối thượng
-  **TUYỆT ĐỐI KHÔNG PUSH TRỰC TIẾP VÀO NHÁNH `main`**. Nhánh `main` chỉ dành cho code final.
-  **NHÓM 2+3 CHỈ ĐƯỢC PUSH CODE LÊN NHÁNH `web`**.
- Luôn `git pull origin web` trước khi bắt đầu code để tránh conflict.

### 2. Quy trình làm việc
1. `git checkout web` (Đảm bảo đang ở nhánh web).
2. `git pull origin web` (Cập nhật code mới nhất).
3. Code chức năng...
4. `git add .`
5. `git commit -m "[Loại] Nội dung thay đổi"`
6. `git push origin web`
Chú ý: Có thể đọc thêm `AllgitCommand.txt` để biết thêm chi tiết.

### 3. Format Commit Message
Sử dụng format khi commit: `[Prefix] Mô tả ngắn gọn`
- `[Feat]`: Tính năng mới (VD: `[Feat] Thêm nút ghi âm`)
- `[Fix]`: Sửa lỗi (VD: `[Fix] Lỗi không kết nối được socket`)
- `[UI]`: Chỉnh sửa giao diện (VD: `[UI] Cập nhật màu background`)
- `[Docs]`: Tài liệu (VD: `[Docs] Cập nhật README`)
- `[Refactor]`: Tối ưu code (VD: `[Refactor] Tách component ChatBox`)

---
**Chúc các bạn làm việc hiệu quả! **
