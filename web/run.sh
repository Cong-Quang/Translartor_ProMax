#!/bin/bash

# Web (Frontend) Run Script
# Usage: sudo ./run.sh

echo "=== STARTING WEB FRONTEND (NGINX + SSL) ==="

# 1. Install Dependencies (if missing)
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx & OpenSSL..."
    apt update && apt install -y nginx openssl
fi

# 2. Generate Self-Signed SSL (if missing)
if [ ! -f "/etc/nginx/ssl/selfsigned.crt" ]; then
    echo "Generating SSL Certificate..."
    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/selfsigned.key \
        -out /etc/nginx/ssl/selfsigned.crt \
        -subj "/C=VN/ST=HCM/L=HCM/O=XomNhaLa/OU=IT/CN=xomnhala.ddns.net"
fi

# 3. Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/translartor <<EOF
server {
    listen 3000 ssl;
    server_name xomnhala.ddns.net;

    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    # Frontend (Static Files)
    # Assumes files are in ./dist relative to this script, or upload to /var/www/translartor/dist
    # We will map /var/www/translartor/dist
    location / {
        root /var/www/translartor/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/translartor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Cleanup & Start
echo "Restarting Nginx..."
pkill -F nginx || true
pkill -f nginx || true
nginx

echo "=== WEB FRONTEND STARTED ==="
echo "Access at: https://xomnhala.ddns.net:3000"
