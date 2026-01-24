#!/bin/bash

echo "🚀 Bắt đầu build Mediasoup cho Termux..."

# 1. Cài đặt các công cụ cần thiết từ Termux repository
echo "📦 Đang cài đặt công cụ build (ninja, meson, clang)..."
pkg install -y python build-essential clang ninja meson

# 2. Di chuyển vào thư mục worker của mediasoup
cd node_modules/mediasoup/worker || { echo "❌ Không tìm thấy thư mục node_modules/mediasoup/worker. Hãy chạy 'npm install' trước."; exit 1; }

# 3. Xóa thư mục build cũ nếu có
echo "🧹 Dọn dẹp build cũ..."
rm -rf out

# 4. Cấu hình build với Meson
echo "⚙️  Đang cấu hình build (Meson)..."
# Force sử dụng cc/c++ là clang (mặc định trên Termux)
export CC=clang
export CXX=clang++
meson setup out/Release --buildtype=release

# 5. Biên dịch với Ninja
echo "🔨 Đang biên dịch (Ninja)..."
ninja -C out/Release

# 6. Kiểm tra kết quả
if [ -f "out/Release/mediasoup-worker" ]; then
    echo "✅ Build thành công! File mediasoup-worker đã sẵn sàng."
    echo "📍 Đường dẫn: $(pwd)/out/Release/mediasoup-worker"
    echo "👉 Bây giờ bạn có thể quay lại thư mục gốc và chạy 'node index.js'"
else
    echo "❌ Build thất bại. Không tìm thấy file mediasoup-worker."
    exit 1
fi
