# Cấu trúc Logic Hệ thống

## 1. Luồng dữ liệu (Data Flow)

### A. Tạo phòng họp (Create Room)
1. Người dùng nhập tên phòng và tùy chọn (Mật khẩu, AI).
2. Hệ thống tạo ID ngẫu nhiên định dạng `xxx-xxx-xxx`.
3. Client gọi `supabase.from('rooms').insert()` để lưu thông tin.
4. Hiển thị ID phòng thành công để người dùng chia sẻ.

### B. Tham gia phòng họp (Join Room)
1. Người dùng nhập Room ID.
2. Hệ thống gọi `supabase.from('rooms').select()` để kiểm tra sự tồn tại.
3. Nếu phòng là `is_private`, hiển thị thêm ô nhập mật khẩu và so khớp tại Client.
4. Sau khi xác thực, hệ thống cho phép tham gia vào luồng kết nối WebRTC.

## 2. Quản lý Giao diện (Theme & i18n)
- **Giao diện**: Sử dụng CSS Variables định nghĩa trong `index.css`. Lớp `.dark` hoặc `.blue` được thêm vào thẻ `<html>` để chuyển đổi toàn bộ màu sắc.
- **Đa ngôn ngữ**: Toàn bộ chuỗi văn bản được quản lý trong `i18n.ts`. Hàm `t(key)` trong `ConfigContext` chịu trách nhiệm trả về ngôn ngữ tương ứng với cài đặt hiện tại.

## 3. Database Schema (Supabase)
### Bảng `rooms`
- `id` (PK): Định danh duy nhất của phòng.
- `name`: Tên hiển thị của phòng họp.
- `is_private`: Trạng thái bảo mật.
- `password`: Mật khẩu truy cập (nếu có).
- `enable_ai`: Cấu hình bật/tắt dịch thuật AI.
- `created_at`: Thời điểm tạo phòng.