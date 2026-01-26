#!/bin/bash

# Translartor ProMax - Backend Setup Script (Ubuntu)
# Run as root: sudo ./setup_backend_ubuntu.sh

APP_DIR="/root/backend"  # Change this if you put code elsewhere
USER="root"              # User to run the service

echo "=== Setting up Backend Service ==="

# 1. Install Python & Venv
echo "--> Installing Python..."
apt update
apt install -y python3 python3-pip python3-venv

# 2. Setup Virtual Environment
echo "--> Setting up venv..."
cd $APP_DIR
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 3. Install Dependencies
echo "--> Installing requirements..."
source venv/bin/activate
pip install -r requirements.txt

# 4. Create Systemd Service
echo "--> Creating Systemd Service..."
cat > /etc/systemd/system/translartor-backend.service <<EOF
[Unit]
Description=Translartor ProMax Backend
After=network.target

[Service]
User=$USER
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
ExecStart=$APP_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 5. Start Service
echo "--> Starting Service..."
systemctl daemon-reload
systemctl enable translartor-backend
systemctl restart translartor-backend

echo "=== Backend Setup Complete ==="
echo "Check status with: systemctl status translartor-backend"
