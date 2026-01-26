#!/bin/bash

# Translartor ProMax - Automated Ubuntu Setup Script (Custom Port 8000)
# Run as root: sudo ./setup_ubuntu.sh

DOMAIN="xomnhala.ddns.net"
HTTPS_PORT="3000"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"

echo "=== Starting Setup for $DOMAIN on Port $HTTPS_PORT ==="

# 1. Update and Install Nginx + Certbot
echo "--> Installing Nginx and Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# 2. Create Nginx Configuration
# Strategy:
# - Listen on Port 80 (Standard HTTP) solely for Let's Encrypt validation and redirecting to HTTPS
# - Listen on Port 8000 (HTTPS) for the actual Application
echo "--> configuring Nginx..."
cat > /etc/nginx/sites-available/translartor <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Let's Encrypt validation path
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect everything else to HTTPS on custom port
    location / {
        return 301 https://\$host:$HTTPS_PORT\$request_uri;
    }
}

server {
    listen $HTTPS_PORT ssl;
    server_name $DOMAIN;

    # SSL Configuration (Placeholders, Certbot will fill these)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
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

# 3. Enable Site
echo "--> Enabling site..."
ln -sf /etc/nginx/sites-available/translartor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Utilities setup
ufw allow 'Nginx Full'
ufw allow 8000/tcp # Allow custom port

# 5. Check configuration
# Note: This might fail initially because SSL certs paths are missing in the config above.
# We will rely on Certbot only or we need a trick. 
# actually best to let Certbot create the SSL block from a plain HTTP block first?
# No, Certbot is smart but "listen 8000 ssl" without certs crashes nginx test.
# WORKAROUND: Create HTTP-only block first on 8000, let Certbot sign it, then switch to SSL?
# OR: Use certbot certonly first.

# Phase 1 Config: Only HTTP 80
cat > /etc/nginx/sites-available/translartor <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/html;
}
EOF
systemctl restart nginx

# 6. Request SSL Certificate
echo "--> Requesting SSL Certificate (via Port 80)..."
certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --deploy-hook "systemctl reload nginx"

# Check if cert exists
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "--> Certificate obtained! Configuring Nginx for Port $HTTPS_PORT..."
    
    # Phase 2 Config: Real Config with SSL
    cat > /etc/nginx/sites-available/translartor <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location / {
        return 301 https://\$host:$HTTPS_PORT\$request_uri;
    }
}

server {
    listen $HTTPS_PORT ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
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
    systemctl restart nginx
    echo "=== Setup Complete! ==="
    echo "Access your site at: https://$DOMAIN:$HTTPS_PORT"
else
    echo "Error: SSL Certificate could not be obtained."
    echo "Make sure Port 80 is forwarded to this server during setup!"
    exit 1
fi
