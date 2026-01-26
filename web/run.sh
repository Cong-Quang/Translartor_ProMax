#!/bin/bash

# Translartor ProMax - Termux Launcher
echo "=================================================="
echo "      Translartor ProMax - Auto Launcher"
echo "=================================================="
echo ""

# 1. Check Node.js
echo "[1/2] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install it via: sudo apt install nodejs npm"
    exit 1
fi
echo "Node.js found: $(node -v)"
echo ""

# 2. Check Python (Skipped - Backend Remote)

# 3. Setup Frontend
echo ""
echo "[2/2] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
fi
cd ..

echo ""
echo "=================================================="
echo "      All checks passed. Starting Frontend..."
echo "=================================================="
echo ""

# Start Services
echo "Starting Frontend..."
# Run frontend
cd frontend && npm run dev -- --host --port 3000
