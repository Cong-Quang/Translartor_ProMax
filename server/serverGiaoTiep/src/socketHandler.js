const mediasoupHandler = require('./mediasoupHandler');

/**
 * Xử lý các sự kiện của Socket.IO
 * @param {Object} io - Instance của Socket.IO
 */
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Signaling] Thiết bị kết nối mới: ${socket.id}`);

        // --- MEDIASOUP SIGNALING ---

        // 1. Client yêu cầu Router RTP Capabilities
        socket.on('getRouterRtpCapabilities', (callback) => {
            const rtpCapabilities = mediasoupHandler.getRouterRtpCapabilities();
            callback({ rtpCapabilities });
        });

        // 2. Client yêu cầu tạo Transport (để gửi hoặc nhận)
        socket.on('createWebRtcTransport', async (callback) => {
            const transport = await mediasoupHandler.createWebRtcTransport(callback);
            if (transport) {
                // Lưu transport ID vào socket để quản lý nếu cần
                // socket.transportId = transport.id; 
            }
        });

        // 3. Client kết nối Transport (gửi DTLS parameters)
        socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
            const transport = mediasoupHandler.getTransport(transportId);
            if (transport) {
                await transport.connect({ dtlsParameters });
                callback({ success: true });
            } else {
                callback({ error: 'Transport not found' });
            }
        });

        // 4. Client muốn gửi Media (Produce)
        socket.on('produce', async ({ transportId, kind, rtpParameters }, callback) => {
            const transport = mediasoupHandler.getTransport(transportId);
            if (transport) {
                const producer = await transport.produce({ kind, rtpParameters });
                mediasoupHandler.addProducer(producer);

                // Thông báo cho các client khác biết có producer mới (để họ consume)
                socket.broadcast.emit('newProducer', { producerId: producer.id });

                callback({ id: producer.id });
            } else {
                callback({ error: 'Transport not found' });
            }
        });

        // 5. Client muốn nhận Media (Consume)
        socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
            const transport = mediasoupHandler.getTransport(transportId);
            const router = mediasoupHandler.router; // Cần access router để check canConsume

            if (transport && mediasoupHandler.router.canConsume({ producerId, rtpCapabilities })) {
                const consumer = await transport.consume({
                    producerId,
                    rtpCapabilities,
                    paused: true, // Bắt đầu pause, client sẽ resume sau
                });

                mediasoupHandler.addConsumer(consumer);

                // Handle events
                consumer.on('transportclose', () => {
                    // console.log('transport close');
                });

                consumer.on('producerclose', () => {
                    // console.log('producer close');
                    socket.emit('producerClosed', { producerId });
                });

                callback({
                    id: consumer.id,
                    producerId: producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    type: consumer.type,
                    producerPaused: consumer.producerPaused
                });
            } else {
                callback({ error: 'Cannot consume or Transport not found' });
            }
        });

        // 6. Resume Consumer
        // 6. Resume Consumer
        socket.on('resume', async ({ consumerId }, callback) => {
            const consumer = mediasoupHandler.getConsumer(consumerId);
            if (consumer) {
                await consumer.resume();
                callback({ success: true });
            } else {
                callback({ error: 'Consumer not found' });
            }
        });

        // --- OLD SIGNALING (Giữ lại nếu cần text chat/signal thuần) ---
        socket.on('signal', (data) => {
            socket.broadcast.emit('signal', data);
        });

        // Xử lý ngắt kết nối
        socket.on('disconnect', () => {
            console.log(`[Signaling] Thiết bị đã ngắt kết nối: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
