# Hướng dẫn Thiết lập Dự án

## 1. Yêu cầu hệ thống
- **Node.js**: v18 trở lên.
- **Python**: 3.10 trở lên.
- **Tài khoản Supabase**: Đăng ký miễn phí tại [supabase.com](https://supabase.com/).

## 2. Cấu hình Database (Supabase)
1. Tạo một dự án mới trên Supabase Dashboard.
2. Vào mục **SQL Editor**, chọn **New Query** và dán đoạn mã sau để tạo bảng:
   ```sql
   create table rooms (
     id text primary key,
     name text not null,
     is_private boolean default false,
     password text,
     enable_ai boolean default true,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```
3. Lấy **Project URL** và **Anon Key** trong mục **Project Settings > API**.

## 3. Cài đặt Frontend
1. Vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. **Cấu hình Supabase**
   - Mở file `frontend/src/config.ts`.
   - Tìm mục `SUPABASE` và điền thông tin của bạn vào (hoặc sử dụng file `.env` nếu muốn bảo mật hơn):
     ```typescript
     SUPABASE: {
         URL: "đường_dẫn_supabase_của_bạn",
         KEY: "mã_key_anon_của_bạn",
     },
     ```
4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

## 4. Cài đặt Backend
1. Vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt môi trường ảo và thư viện:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Chạy server:
   ```bash
   python main.py
   ```