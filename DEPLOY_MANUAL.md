# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (DEPLOY MANUAL)

Tài liệu này hướng dẫn chi tiết cách cài đặt server Ubuntu để chạy ứng dụng **Translartor ProMax** với cấu hình:
-   **Web (Frontend)**: Chạy HTTPS trên cổng **3000**.
-   **Server (Backend)**: Chạy ngầm (Service) trên cổng **3001**.

---

## 1. CHUẨN BỊ (PREREQUISITES)

-   Một server Ubuntu (VPS).
-   Tên miền (DDNS): `xomnhala.ddns.net`.
-   Router đã **Mở Port (Port Forwarding)**:
    -   Port `3000` -> IP Server Ubuntu.

---

## 2. CÀI ĐẶT & CHẠY (SETUP & RUN)

Tôi đã tối ưu chỉ còn 2 file script. Bạn thực hiện như sau:

### Bước 1: Chạy Server (Backend)
1.  Upload thư mục `server` lên.
2.  Chạy lệnh:
    ```bash
    cd server
    chmod +x run.sh
    sudo ./run.sh
    ```

### Bước 2: Chạy Web (Frontend)
1.  Upload thư mục `web` lên (nhớ upload cả folder `dist` đã build vào trong đó, hoặc copy `dist` vào `/var/www/translartor/dist` nếu script yêu cầu).
    *Script `web/run.sh` của tôi sẽ trỏ Nginx vào `/var/www/translartor/dist`. Hãy tạo thư mục đó và copy file vào.*
    ```bash
    sudo mkdir -p /var/www/translartor/dist
    # (Copy file từ máy bạn lên folder này)
    ```
2.  Chạy lệnh:
    ```bash
    cd web
    chmod +x run.sh
    sudo ./run.sh
    ```

---

## 3. CẬP NHẬT (UPDATE)

-   **Backend**: Copy code mới -> Chạy lại `./run.sh` ở thư mục server.
-   **Web**: Copy file `dist` mới vào `/var/www/translartor/dist` -> Xong (không cần chạy lại script).

---

## 4. CẤU HÌNH SUPABASE (QUAN TRỌNG)
Để đăng nhập được, bạn phải cập nhật **Supabase Dashboard**:

1.  Vào **Authentication** > **URL Configuration**.
2.  **Site URL**: `https://xomnhala.ddns.net:3000`
3.  **Redirect URLs**: Thêm dòng `https://xomnhala.ddns.net:3000/**`

---

## 5. TRUY CẬP WEBSITE

-   Địa chỉ: **https://xomnhala.ddns.net:3000**
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

