const CONFIG = {
    PORT: process.env.PORT || 3000,
    HOST: '0.0.0.0',
    CORS_ORIGIN: "*",
    CORS_METHODS: ["GET", "POST"],

    // Mediasoup Settings
    MEDIASOUP: {
        // Worker settings
        numWorkers: Object.keys(require('os').cpus()).length,
        worker: {
            logLevel: 'warn',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                // 'rtx',
                // 'bwe',
                // 'score',
                // 'simulcast',
                // 'svc'
            ],
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
        },
        // Router settings
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000
                    }
                },
            ]
        },
        // WebRtcTransport settings
        webRtcTransport: {
            listenIps: [
                {
                    ip: '0.0.0.0',
                    announcedIp: 'xomnhala.ddns.net'
                }
            ],
            initialAvailableOutgoingBitrate: 1000000,
        }
    }
};

module.exports = CONFIG;
