# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (DEPLOY MANUAL)

Tài liệu này hướng dẫn chi tiết cách cài đặt server Ubuntu để chạy ứng dụng **Translartor ProMax** với cấu hình:
-   **Web (Frontend)**: Chạy HTTPS trên cổng **8000**.
-   **Server (Backend)**: Chạy ngầm (Service) trên cổng **3001**.

---

## 1. CHUẨN BỊ (PREREQUISITES)

-   Một server Ubuntu (VPS).
-   Tên miền (DDNS): `xomnhala.ddns.net`.
-   Router đã **Mở Port (Port Forwarding)**:
    -   Port `8000` -> IP Server Ubuntu.

---

## 2. CÀI ĐẶT LẦN ĐẦU (SETUP)
*Chỉ cần thực hiện bước này 1 lần duy nhất khi mới bắt đầu.*

### Bước 1: Upload Script
Copy 2 file script có sẵn trong dự án lên Server (dùng SCP hoặc tạo file mới):
1.  `setup_ubuntu_selfsigned.sh` (Script cài Nginx & SSL).
2.  `server/backend/setup_backend_ubuntu.sh` (Script cài Service Backend).

### Bước 2: Cài đặt Backend
1.  Upload toàn bộ thư mục `server/backend` lên server (ví dụ tại `/root/backend`).
2.  Chạy lệnh cài đặt:
    ```bash
    cd /root/backend
    chmod +x setup_backend_ubuntu.sh
    sudo ./setup_backend_ubuntu.sh
    ```
    *-> Backend sẽ tự động chạy và khởi động cùng hệ thống.*

### Bước 3: Cài đặt Frontend (Nginx & SSL)
1.  Tại thư mục chứa file `setup_ubuntu_selfsigned.sh` trên server, chạy lệnh:
    ```bash
    chmod +x setup_ubuntu_selfsigned.sh
    sudo ./setup_ubuntu_selfsigned.sh
    ```
    *-> Nginx sẽ được cài đặt, tạo chứng chỉ SSL và cấu hình để phục vụ Web tại cổng 8000.*

---

## 3. VẬN HÀNH & CẬP NHẬT (RUN & UPDATE)
*Thực hiện các bước này mỗi khi bạn sửa code và muốn cập nhật lên server.*

### A. Cập nhật Backend (Server)
Khi bạn sửa code Python/API:
1.  Copy đè các file code mới vào thư mục trên server (`/root/backend`).
2.  Khởi động lại service để nhận code mới:
    ```bash
    sudo systemctl restart translartor-backend
    ```
    *(Muốn xem log lỗi nếu có: `sudo journalctl -u translartor-backend -f`)*

### B. Cập nhật Frontend (Web)
Khi bạn sửa code React/Giao diện:
1.  Tại máy tính cá nhân, chạy lệnh Build:
    ```bash
    npm run build
    ```
    *(Lệnh này tạo ra thư mục `dist` chứa code đã đóng gói)*.
2.  Upload/Copy nội dung bên trong thư mục `dist` lên server vào đường dẫn `/var/www/translartor/dist`.
    -   Ví dụ dùng SCP: `scp -r dist/* user@xomnhala.ddns.net:/var/www/translartor/dist`
    *-> Không cần khởi động lại gì cả, F5 trình duyệt là thấy thay đổi.*

---

## 4. CẤU HÌNH SUPABASE (QUAN TRỌNG)
Để đăng nhập được, bạn phải cập nhật **Supabase Dashboard**:

1.  Vào **Authentication** > **URL Configuration**.
2.  **Site URL**: `https://xomnhala.ddns.net:8000`
3.  **Redirect URLs**: Thêm dòng `https://xomnhala.ddns.net:8000/**`

---

## 5. TRUY CẬP WEBSITE

-   Địa chỉ: **https://xomnhala.ddns.net:8000**
-   **Lưu ý:** Vì dùng chứng chỉ tự ký (Self-Signed), trình duyệt sẽ hiện cảnh báo đỏ "Not Secure".
    -   Bạn cần bấm **Advanced (Nâng cao)** -> **Proceed to... (Tiếp tục truy cập)**.
    -   Sau đó Camera và Micro sẽ hoạt động bình thường.

---

## 6. KHẮC PHỤC SỰ CỐ (TROUBLESHOOTING)

### Lỗi "System has not been booted with systemd"
Nếu bạn chạy script cài đặt mà gặp lỗi này (thường do dùng Docker hoặc WSL), hãy dùng **Script chạy thủ công** thay vì các script setup tự động.

1.  Copy file `manual_start.sh` lên server.
2.  Chạy: `chmod +x manual_start.sh && ./manual_start.sh`.
    -   Nó sẽ bật Nginx và Backend lên ngay lập tức mà không cần Systemd.

