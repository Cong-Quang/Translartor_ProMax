#!/bin/bash

# Server (Backend) Run Script
# Usage: sudo ./run.sh

echo "=== STARTING BACKEND SERVER ==="

# 1. Install Python (if missing)
if ! command -v python3 &> /dev/null; then
    echo "Installing Python..."
    apt update && apt install -y python3 python3-venv python3-pip
fi

# 2. Locate App Directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try to find where 'app/main.py' is
if [ -f "$SCRIPT_DIR/backend/app/main.py" ]; then
    APP_DIR="$SCRIPT_DIR/backend"
elif [ -f "$SCRIPT_DIR/app/main.py" ]; then
    APP_DIR="$SCRIPT_DIR"
else
    echo "ERROR: Could not find 'app/main.py'."
    echo "Please make sure you uploaded the 'backend' folder (inside 'server' or directly)."
    exit 1
fi

echo "Found Backend in: $APP_DIR"
cd "$APP_DIR"

# 3. Setup Venv & Install Requirements
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Installing/Updating Dependencies..."
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "WARNING: requirements.txt not found!"
fi

# 4. Start Backend (Restart if running)
echo "Restarting Backend Process..."
pkill -f "uvicorn app.main:app" || true

# Start with nohup
nohup uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload > backend.log 2>&1 &

PID=$!
echo "=== BACKEND STARTED (PID: $PID) ==="
echo "Logs available at: $APP_DIR/backend.log"
