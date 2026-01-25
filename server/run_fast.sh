#!/bin/bash

# Translartor ProMax Backend - Termux Run Script
echo "[INFO] Starting Translartor ProMax Backend on Termux..."

# Navigate to script directory
cd "$(dirname "$0")"

# Navigate to backend
cd backend

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "[INFO] Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements if not already satisfied (quietly check or just run install)
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt
fi

# Run application
# Host 0.0.0.0 allows access from outside Termux (e.g. WiFi)
python main.py

# Cleanup on exit
echo ""
echo "[INFO] Server stopped. Cleaning up cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

echo "[INFO] Cleanup complete."
