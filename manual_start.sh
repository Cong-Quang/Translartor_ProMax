#!/bin/bash

# Translartor ProMax - Manual Start Script
# Dùng script này nếu bạn bị lỗi "System has not been booted with systemd" (Ví dụ: Docker, WSL)

# Auto-detect APP_DIR
# 1. Check if we are inside the project root (e.g. ~/Translartor_ProMax)
if [ -d "./server/backend" ]; then
    APP_DIR="$(pwd)/server/backend"
# 2. Check standard /root/backend
elif [ -d "/root/backend" ]; then
    APP_DIR="/root/backend"
# 3. Check full path assumption
elif [ -d "/root/Translartor_ProMax/server/backend" ]; then
    APP_DIR="/root/Translartor_ProMax/server/backend"
else
    # Fallback, but print warning
    APP_DIR="/root/backend"
fi

echo "Detected Backend Dir: $APP_DIR"
echo "=== STARTING SERVICES MANUALLY ==="

# 1. Start Nginx
echo "--> Starting Nginx..."
if pgrep nginx > /dev/null; then
    echo "Nginx is already running. Reloading config..."
    nginx -s reload
else
    # Start Nginx in background
    nginx
    if [ $? -eq 0 ]; then
        echo "Nginx started successfully."
    else
        echo "Failed to start Nginx."
    fi
fi

# 2. Start Backend
echo "--> Starting Backend..."

if [ ! -d "$APP_DIR" ]; then
    echo "ERROR: Directory $APP_DIR not found."
    echo "Please edit this script to match your backend folder location."
    exit 1
fi

cd $APP_DIR

# Install deps if missing (Safety check)
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Kill old process if running
pkill -f "uvicorn app.main:app" || true

# Start with nohup
nohup uvicorn app.main:app --host 0.0.0.0 --port 3001 > backend.log 2>&1 &
PID=$!

echo "Backend started with PID $PID."
echo "Logs available at: $APP_DIR/backend.log"
echo "=== ALL SERVICES STARTED ==="
