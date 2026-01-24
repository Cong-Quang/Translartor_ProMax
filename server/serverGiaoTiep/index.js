const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const CONFIG = require('./src/config');
const socketHandler = require('./src/socketHandler');

const mediasoupHandler = require('./src/mediasoupHandler');

// Khởi tạo ứng dụng Express
const app = express();
app.use(cors());

// Khởi tạo HTTP server
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
    cors: {
        origin: CONFIG.CORS_ORIGIN,
        methods: CONFIG.CORS_METHODS
    }
});

// Khởi chạy
const startServer = async () => {
    try {
        // Init Mediasoup
        await mediasoupHandler.init();

        // Gắn các handler cho socket
        socketHandler(io);

        // Start HTTP Server
        server.listen(CONFIG.PORT, CONFIG.HOST, () => {
            console.log(`=================================================`);
            console.log(`🚀 Media Server (Mediasoup) đang chạy...`);
            console.log(`📡 PORT: ${CONFIG.PORT}`);
            console.log(`🏠 Mode: Termux / Node.js Environment`);
            console.log(`=================================================`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
