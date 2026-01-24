# Hướng dẫn Phát triển Video Conference Web App

Tài liệu này chi tiết các công việc cần thực hiện để phát triển ứng dụng web dựa trên yêu cầu từ `todo.txt`.

## 1. Cấu trúc Dự án & Quy định Chung

- **Repo**: `Translartor_ProMax` (nhánh `web`).
- **Thư mục làm việc**: Chỉ làm việc trong thư mục `web/`.
  - Phân chia cấu trúc: `web/frontend` và `web/backend`.
  - **Lưu ý**: Các thư mục khác ngoài `web/` chỉ xem, không được sửa đổi.
- **Môi trường chạy**: Local (kết nối Server sau).
- **Công nghệ**:
  - Ngôn ngữ: `TSX` (TypeScript React).
  - WebRTC Libs: `Peerjs`, `simplewebrtc`.
- **Nguyên tắc file**: Mỗi giao diện là 1 file riêng biệt.

## 2. Cấu hình & Tài nguyên

### File Cấu hình Chung (Bắt buộc)
Cần tạo một file cấu hình trung tâm (ví dụ: `config.ts`) để quản lý toàn bộ các thông số dễ thay đổi:
- Địa chỉ Web.
- Icon, Logo (dùng mẫu tạm thời).
- Màu sắc chủ đạo (Theme).
- Tài khoản Quản trị viên (Admin).
- Ngôn ngữ.
- Các cấu hình quan trọng khác.

### Tài khoản Admin Mặc định
- **ID**: `Admin@123`
- **Pass**: `12345678`

### Script Tự động hóa
Cần tạo file `.bat` để:
1. Kiểm tra Python 3.12.
2. Kiểm tra NPM LTS.
3. Tự động tải về và cài đặt nếu chưa có.
4. Chạy dự án.

## 3. Danh sách Giao diện (Frontend)

Yêu cầu thiết kế đầy đủ các nút bấm và liên kết chức năng.

### Các Giao diện Chính
1.  **Đăng nhập / Xác thực**
2.  **Tạo phòng họp**
3.  **Tham gia phòng họp (Join)**
4.  **Kiểm tra thiết bị (Pre-join)**: Mic, Camera text.
5.  **Phòng họp chính (Meeting Room)**
6.  **Thanh điều khiển (Control Bar)**
7.  **Danh sách người tham gia (Participants Panel)**
8.  **Chat trong cuộc họp**
9.  **Chia sẻ màn hình / Cửa sổ**
10. **Quản lý quyền & Vai trò (Host controls)**
11. **Ghi âm / Ghi hình (Recording)**
12. **Lịch & Lịch sử cuộc họp**
13. **Thông báo & Trạng thái hệ thống**
14. **Kết thúc cuộc họp & Tổng kết (Meeting Summary)**

### Các Giao diện trên Sidebar Ngang
Chỉ bao gồm 4 mục sau:
1.  **Cài đặt**
2.  **Hướng dẫn**
3.  **Giới thiệu**
4.  **Thông tin người dùng**
5.  **Trang chủ**
