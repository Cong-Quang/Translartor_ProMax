#!/bin/bash

# Translartor ProMax Backend - Linux/Ubuntu Run Script
echo "[INFO] Starting Translartor ProMax Backend..."

# Navigate to script directory
cd "$(dirname "$0")"

# Navigate to backend
cd backend

# Auto-detect python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi
echo "[INFO] Using Python command: $PYTHON_CMD"

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "[INFO] Creating virtual environment..."
    $PYTHON_CMD -m venv venv || {
        echo "[ERROR] Failed to create venv."
        echo "On Ubuntu, you may need to run: sudo apt install python3-venv"
        exit 1
    }
fi

# Activate venv
source venv/bin/activate

# Install requirements
requirements_file="requirements.txt"
if [ -f "$requirements_file" ]; then
    echo "[INFO] Checking requirements..."
    pip install -q -r "$requirements_file"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install requirements."
        echo "If you see build errors, you may need system dependencies."
        echo "On Ubuntu, try: sudo apt install build-essential python3-dev"
        exit 1
    fi
fi

# Run application
# Host 0.0.0.0 allows access from LAN
python main.py

# Cleanup on exit
echo ""
echo "[INFO] Server stopped. Cleaning up cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

echo "[INFO] Cleanup complete."
