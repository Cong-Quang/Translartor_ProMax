#!/bin/bash

# Translartor ProMax - Ubuntu Setup (Self-Signed SSL)
# Run as root: sudo ./setup_ubuntu_selfsigned.sh
# USE THIS IF YOU CANNOT OPEN PORT 80

DOMAIN="xomnhala.ddns.net"
HTTPS_PORT="3000"
FRONTEND_PORT="3000" # Not used for proxying anymore since we serve static, but good to keep var
BACKEND_PORT="3001"

echo "=== Starting Setup for $DOMAIN (Self-Signed SSL) ==="

# 1. Install Nginx
apt update
apt install -y nginx openssl

# 2. Generate Self-Signed Certificate
echo "--> Generating Self-Signed Certificate..."
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=VN/ST=HCM/L=HCM/O=XomNhaLa/OU=IT/CN=$DOMAIN"

# 3. Create Nginx Configuration
echo "--> Configuring Nginx..."
cat > /etc/nginx/sites-available/translartor <<EOF
server {
    listen $HTTPS_PORT ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    # Frontend (Static Files)
    location / {
        root /var/www/translartor/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

# 4. Enable Site
ln -sf /etc/nginx/sites-available/translartor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 5. Allow Firewall
ufw allow $HTTPS_PORT/tcp

# 6. Restart Nginx
if nginx -t; then
    systemctl restart nginx
    echo "=== Setup Complete! ==="
    echo "URL: https://$DOMAIN:$HTTPS_PORT"
    echo "WARNING: This is a Self-Signed Certificate."
    echo "Browser will show 'Not Secure'. You must click 'Advanced' -> 'Proceed'."
else
    echo "Nginx config failed."
fi
