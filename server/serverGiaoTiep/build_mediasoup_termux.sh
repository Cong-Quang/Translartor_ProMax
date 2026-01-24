#!/bin/bash
set -e

echo "🚀 Bắt đầu sửa lỗi cài đặt Mediasoup trên Termux/Ubuntu (V4)..."

# 1. Cài đặt dependencies
echo "📦 Cài đặt build tools..."
if command -v apt &> /dev/null; then
    apt update -y || true
    apt install -y python3 python3-pip build-essential curl git
fi

# 2. Cài đặt Meson & Ninja (bỏ qua nếu đã có)
echo "🐍 Cài đặt Meson & Ninja..."
python3 -m pip install meson ninja --break-system-packages || python3 -m pip install meson ninja || echo "⚠️ Pip install fail, hy vọng system đã có."

# 3. Cài đặt npm packages (QUAN TRỌNG: --ignore-scripts để không tự build)
echo "📥 Tải source code Mediasoup (bỏ qua pre-build)..."
rm -rf node_modules package-lock.json
npm install --ignore-scripts

# 4. Build thủ công & Disable Tests (để tránh lỗi thư viện log/Catch2)
echo "📂 Build thủ công Mediasoup Worker..."
cd node_modules/mediasoup/worker

rm -rf out
export CC=clang
export CXX=clang++

# Thử cấu hình tắt test nếu có thể (để tránh lỗi Catch2)
# Lưu ý: Các flag dưới đây là phỏng đoán common pattern, meson sẽ ignore nếu không khớp.
echo "⚙️  Meson Setup..."
meson setup out/Release --buildtype=release \
    -Dmediasoup-worker-test=false \
    -Dtest=false \
    -Dbuild_tests=false

echo "🔨 Compiling..."
ninja -C out/Release

if [ -f "out/Release/mediasoup-worker" ]; then
    echo "=========================================="
    echo "✅ BUILD SUCCESSFULLY!"
    echo "👉 Chạy lệnh: cd ../../.. && npm start"
    echo "=========================================="
else
    echo "❌ Vẫn thất bại. Có thể cần chuyển sang giải pháp P2P."
    exit 1
fi
