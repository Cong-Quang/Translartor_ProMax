#!/bin/bash
set -e

echo "🚀 Bắt đầu sửa lỗi cài đặt Mediasoup trên Termux/Ubuntu (V5 - Force Disable Tests)..."

# 1. Cài đặt dependencies hệ thống
echo "📦 Cài đặt tools..."
if command -v apt &> /dev/null; then
    apt update -y || true
    apt install -y python3 python3-pip build-essential curl git
fi

# 2. Cài đặt Python Build Tools
echo "🐍 Cài đặt Meson & Ninja..."
python3 -m pip install meson ninja --break-system-packages || echo "⚠️ Pip install fail, hy vọng system đã có."

# 3. Tải Node modules (bỏ qua build lỗi)
echo "📥 Tải mã nguồn Mediasoup..."
rm -rf node_modules package-lock.json
npm install --ignore-scripts

# 4. CHỈNH SỬA FILE CẤU HÌNH BUILD (Patching)
echo "� Đang vá file meson.build để tắt hẳn Test..."
cd node_modules/mediasoup/worker

# Backup
cp meson.build meson.build.bak

# Dùng sed để comment dòng subdir('test') -> #subdir('test')
# Điều này ngăn Meson đọc thư mục test, từ đó không load Catch2.
sed -i "s/subdir('test')/#subdir('test')/g" meson.build

# Nếu có dòng khai báo dependency catch2, cũng comment lại để chắc chắn
sed -i "s/catch2_dep = dependency/#catch2_dep = dependency/g" meson.build

echo "✅ Đã patch meson.build"

# 5. Build thủ công
echo "📂 Bắt đầu build..."
rm -rf out
export CC=clang
export CXX=clang++

echo "⚙️  Meson Setup..."
# Vẫn thêm flag disable test cho chắc
meson setup out/Release --buildtype=release -Dmediasoup-worker-test=false

echo "🔨 Compiling..."
ninja -C out/Release

if [ -f "out/Release/mediasoup-worker" ]; then
    echo "=========================================="
    echo "✅ BUILD SUCCESSFULLY! (V5)"
    echo "👉 Chạy lệnh: cd ../../.. && npm start"
    echo "=========================================="
else
    echo "❌ Build thất bại."
    exit 1
fi
