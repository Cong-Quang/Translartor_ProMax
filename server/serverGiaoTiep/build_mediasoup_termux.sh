#!/bin/bash

# Dừng script ngay nếu có lệnh lỗi
set -e

echo "🚀 Bắt đầu sửa lỗi cài đặt Mediasoup trên Termux (V2)..."

# 1. Cập nhật Repository & Cài đặt cơ bản
echo "🔄 Cập nhật danh sách package..."
pkg update -y || echo "⚠️ Warning: pkg update có lỗi, nhưng sẽ cố gắng tiếp tục."

echo "📦 Cài đặt Python, Clang, Make, Git..."
pkg install -y python clang make git libandroid-support

# 2. Cài đặt Meson và Ninja thông qua PIP (Do pkg không tìm thấy)
echo "🐍 Cài đặt Meson & Ninja qua PIP..."
python3 -m pip install --upgrade pip
python3 -m pip install meson ninja

# Đảm bảo lệnh meson/ninja tìm thấy được
export PATH=$PATH:/data/data/com.termux/files/usr/bin

echo "🔍 Kiểm tra version:"
meson --version || echo "⚠️ Không tìm thấy meson"
ninja --version || echo "⚠️ Không tìm thấy ninja"

# 3. Cài đặt node_modules
echo "📥 Cài đặt NPM dependencies (bỏ qua scripts)..."
rm -rf node_modules package-lock.json
npm install --ignore-scripts

# 4. Build Mediasoup Worker thủ công
echo "📂 Di chuyển vào thư mục worker..."
cd node_modules/mediasoup/worker

echo "🧹 Dọn dẹp..."
rm -rf out

echo "⚙️  Cấu hình Build (Meson)..."
export CC=clang
export CXX=clang++

# Chạy setup
meson setup out/Release --buildtype=release

echo "🔨 Biên dịch (Ninja)..."
ninja -C out/Release

# 5. Kết thúc
if [ -f "out/Release/mediasoup-worker" ]; then
    echo "=========================================="
    echo "✅ BUILD THÀNH CÔNG!"
    echo "👉 Hãy chạy: cd ../../.. && npm start"
    echo "=========================================="
else
    echo "❌ Build thất bại. Không thấy file output."
    exit 1
fi
