#!/bin/bash

echo "🚀 Bắt đầu sửa lỗi cài đặt Mediasoup trên Termux..."

# 1. Cài đặt các công cụ cần thiết từ Termux repository
echo "📦 Đang cài đặt công cụ system (ninja, meson, clang)..."
pkg install -y python build-essential clang ninja meson git

# 2. Cài đặt node_modules nhưng BỎ QUA quá trình build tự động (vốn đang bị lỗi)
echo "📥 Đang tải thư viện npm (bỏ qua script lỗi)..."
rm -rf node_modules package-lock.json
npm install --ignore-scripts

# 3. Di chuyển vào thư mục worker của mediasoup để build thủ công
echo "📂 Di chuyển vào thư mục mediasoup worker..."
cd node_modules/mediasoup/worker || { echo "❌ Vẫn không tìm thấy thư mục node_modules/mediasoup/worker."; exit 1; }

# 4. Xóa thư mục build cũ nếu có
echo "🧹 Dọn dẹp build cũ..."
rm -rf out

# 5. Cấu hình build với Meson (Sử dụng Clang + Ninja hệ thống)
echo "⚙️  Đang cấu hình build (Meson)..."
export CC=clang
export CXX=clang++
meson setup out/Release --buildtype=release

# 6. Biên dịch với Ninja
echo "🔨 Đang biên dịch (Ninja)..."
ninja -C out/Release

# 7. Kiểm tra kết quả
if [ -f "out/Release/mediasoup-worker" ]; then
    echo "=========================================="
    echo "✅ Build thành công! Mediasoup Worker ok."
    echo "� Hãy chạy lệnh sau để khởi động server:"
    echo "   npm start"
    echo "=========================================="
else
    echo "❌ Build thất bại. Không tạo được file binary."
    exit 1
fi
