#!/bin/bash

# Translartor ProMax - Termux Launcher
echo "=================================================="
echo "      Translartor ProMax - Auto Launcher"
echo "=================================================="
echo ""

# 1. Check Node.js
echo "[1/4] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install it via: pkg install nodejs"
    exit 1
fi
echo "Node.js found: $(node -v)"
echo ""

# 2. Check Python
echo "[2/4] Checking Python..."
if ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed."
    echo "Please install it via: pkg install python"
    exit 1
fi
echo "Python found: $(python --version)"
echo ""

# 3. Setup Backend
echo "[3/4] Setting up Backend..."
BACKEND_DIR="../server/backend"

if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "Creating Python virtual environment in $BACKEND_DIR..."
    python -m venv "$BACKEND_DIR/venv"
fi

echo "Installing backend requirements..."
source "$BACKEND_DIR/venv/bin/activate"
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    pip install -q -r "$BACKEND_DIR/requirements.txt"
fi
deactivate
echo "Backend setup complete."

# 4. Setup Frontend
echo ""
echo "[4/4] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
fi
cd ..

echo ""
echo "=================================================="
echo "      All checks passed. Starting Services..."
echo "=================================================="
echo ""

# Start Services
# We use a trap to kill child processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Starting Backend..."
# Run backend in background
(cd ../server && ./run_fast.sh) &
BACKEND_PID=$!

echo "Starting Frontend..."
# Run frontend
cd frontend && npm run dev -- --host --port 3000

# Wait for backend to finish (if it crashes) or user creates interrupt
wait $BACKEND_PID
