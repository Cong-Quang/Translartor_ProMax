#!/bin/bash

# Server (Backend) Run Script
# Usage: sudo ./run.sh

echo "=== STARTING BACKEND SERVER ==="

# 1. Install Python (if missing)
if ! command -v python3 &> /dev/null; then
    echo "Installing Python..."
    apt update && apt install -y python3 python3-venv python3-pip
fi

# 2. Setup Venv
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR/backend" || cd "$APP_DIR" # Adapt based on where script is placed

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# 3. Start Backend
echo "Starting Backend Process..."
pkill -f "uvicorn app.main:app" || true

nohup uvicorn app.main:app --host 0.0.0.0 --port 3001 > backend.log 2>&1 &

echo "=== BACKEND STARTED ==="
echo "Logs at: $PWD/backend.log"
