const mediasoup = require('mediasoup');
const CONFIG = require('./config');

let worker;
let router;
let producers = [];
let consumers = [];
let transports = [];

const mediasoupHandler = {
    /**
     * Khởi tạo Mediasoup Worker và Router
     */
    init: async () => {
        try {
            worker = await mediasoup.createWorker(CONFIG.MEDIASOUP.worker);

            worker.on('died', () => {
                console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
                setTimeout(() => process.exit(1), 2000);
            });

            console.log(`[Mediasoup] Worker created (pid: ${worker.pid})`);

            router = await worker.createRouter({ mediaCodecs: CONFIG.MEDIASOUP.router.mediaCodecs });
            console.log('[Mediasoup] Router created');

            return { worker, router };
        } catch (error) {
            console.error('[Mediasoup] Init failed:', error);
            throw error;
        }
    },

    /**
     * Lấy RTP Capabilities của Router
     */
    getRouterRtpCapabilities: () => {
        if (!router) return null;
        return router.rtpCapabilities;
    },

    /**
     * Tạo WebRTC Transport cho Client
     */
    createWebRtcTransport: async (callback) => {
        try {
            const transport = await router.createWebRtcTransport(CONFIG.MEDIASOUP.webRtcTransport);

            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    transport.close();
                }
            });

            transport.on('close', () => {
                console.log('[Mediasoup] Transport closed');
            });

            // Lưu transport vào danh sách quản lý
            transports.push(transport);

            callback({
                params: {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                }
            });

            return transport;
        } catch (error) {
            console.error('[Mediasoup] createWebRtcTransport failed:', error);
            callback({ error: error.message });
        }
    },

    /**
     * Helper để lấy transport theo ID
     */
    getTransport: (id) => {
        return transports.find(t => t.id === id);
    },

    /**
     * Thêm producer mới
     */
    addProducer: (producer) => {
        producers.push(producer);

        producer.on('transportclose', () => {
            producer.close();
        });

        producer.on('close', () => {
            console.log('[Mediasoup] Producer closed');
            producers = producers.filter(p => p.id !== producer.id);
        });
    },

    /**
     * Lấy producer
     */
    getProducer: (id) => {
        return producers.find(p => p.id === id);
    },

    /**
     * Thêm consumer mới
     */
    addConsumer: (consumer) => {
        consumers.push(consumer);

        consumer.on('transportclose', () => {
            consumer.close();
        });

        consumer.on('close', () => {
            console.log('[Mediasoup] Consumer closed');
            consumers = consumers.filter(c => c.id !== consumer.id);
        });
    },

    /**
     * Lấy consumer
     */
    getConsumer: (id) => {
        return consumers.find(c => c.id === id);
    },

    /**
     * Helper access routers (optional)
     */
    get router() {
        return router;
    }
};

module.exports = mediasoupHandler;
