#!/bin/bash

# Script cài đặt cho môi trường Ubuntu (chạy trong Termux qua proot-distro)
set -e

echo "🚀 Bắt đầu cài đặt trên môi trường Ubuntu..."

# 1. Kiểm tra môi trường
if ! command -v apt &> /dev/null; then
    echo "❌ Lỗi: Không tìm thấy 'apt'. Hãy đảm bảo bạn đã vào Ubuntu (proot-distro login ubuntu) chưa?"
    exit 1
fi

# 2. Cài đặt dependencies hệ thống
echo "📦 Cập nhật và cài đặt build tools..."
apt update -y
apt install -y python3 python3-pip build-essential curl git net-tools

# 3. Cài đặt Meson & Ninja
echo "🐍 Cài đặt công cụ build (Meson/Ninja)..."
# Thêm cờ --break-system-packages để tránh lỗi trên các bản Ubuntu mới
python3 -m pip install --break-system-packages meson ninja || python3 -m pip install meson ninja

# 4. Cài đặt Node.js modules
echo "📥 Cài đặt thư viện Node.js..."
# Xóa bản cũ để cài lại sạch sẽ
rm -rf node_modules package-lock.json

# Config npm và install
echo "📥 Cài đặt thư viện Node.js..."
rm -rf node_modules package-lock.json

# Sử dụng biến môi trường PYTHON để chỉ định python3 cho node-gyp
PYTHON=python3 npm install

echo "================================================="
echo "✅ Cài đặt hoàn tất!"
echo "👉 Chạy lệnh: npm start"
echo "================================================="
