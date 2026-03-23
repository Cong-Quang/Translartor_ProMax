
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, MoreVertical, Send, Signal, Languages } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import Peer from 'peerjs';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface Participant {
    id: string; // Peer ID / User ID
    name: string;
    stream?: MediaStream;
    cam: boolean;
    mic: boolean;
}

interface ChatMessage {
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
}

const VideoPlayer = ({ stream, isMirrored = false, className = '', ...props }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            muted={isMirrored} // Local stream muted to avoid echo
            playsInline
            className={`${className} ${isMirrored ? 'transform scale-x-[-1]' : ''}`}
            {...props}
        />
    );
};

export const MeetingRoom = () => {
    const { t, CONFIG, language } = useConfig();
    const navigate = useNavigate();
    const { id: roomId } = useParams();

    // Dùng UUID cho PeerJS ID để tránh trùng
    const [myId] = useState(() => crypto.randomUUID());
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Refs for persistence in callbacks
    const participantsRef = useRef<Participant[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Record<string, any>>({}); // Track PeerJS calls

    // UI States
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [meetingTime, setMeetingTime] = useState(0);
    const [showCaptions, setShowCaptions] = useState(false);
    const [translateMode, setTranslateMode] = useState(true); // Toggle dịch
    const [remoteCaptions, setRemoteCaptions] = useState<{ text: string, sender: string, isTranslated: boolean } | null>(null);

    // Media States
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    // Speech Recognition
    const [speechLang, setSpeechLang] = useState(language === 'en' ? 'en-US' : 'vi-VN');
    const [showLangMenu, setShowLangMenu] = useState(false);

    useEffect(() => {
        setSpeechLang(language === 'en' ? 'en-US' : 'vi-VN');
    }, [language]);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useSpeechRecognition({
        lang: speechLang,
        continuous: true,
        clearTranscriptOnListen: true
    });

    // Auto-hide transcript after 5s
    useEffect(() => {
        if (!transcript) return;
        const timer = setTimeout(() => resetTranscript(), 5000);
        return () => clearTimeout(timer);
    }, [transcript, resetTranscript]);

    // Sync speech recognition with mic & captions
    useEffect(() => {
        if (showCaptions && isMicOn) {
            startListening();
        } else {
            stopListening();
        }
    }, [showCaptions, isMicOn, startListening, stopListening]);

    // Sync ref
    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setMeetingTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Gửi config dịch thuật lên server khi speechLang hoặc translateMode thay đổi
    useEffect(() => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        
        socketRef.current.send(JSON.stringify({
            type: 'config',
            translate_mode: translateMode,
            src_lang: speechLang === 'vi-VN' ? 'vi' : 'en',
            target_lang: speechLang === 'vi-VN' ? 'vi' : 'en' // Dịch sang cùng ngôn ngữ đang chọn
        }));
    }, [speechLang, translateMode, socketRef.current?.readyState]);

    // Gửi Voice Transcript lên server để dịch (nếu có transcript mới) sau khi debounce
    useEffect(() => {
        if (!transcript || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        
        const timer = setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                // Gửi transcript đi dịch sau khi ngưng nói 1s
                socketRef.current.send(JSON.stringify({
                    type: 'translate-text',
                    content: transcript
                }));
            }
        }, 1000); // Đợi 1s không có từ mới thì mới dịch
        
        return () => clearTimeout(timer); // Xoá timer nếu transcript thay đổi liên tục
    }, [transcript]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize Local Media
    useEffect(() => {
        let isMounted = true;
        let stream: MediaStream | null = null;

        const initMedia = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isMounted) {
                    s.getTracks().forEach(track => track.stop());
                    return;
                }
                stream = s;
                setLocalStream(s);
                localStreamRef.current = s;
            } catch (err) {
                console.error("Error accessing media:", err);
            }
        };

        initMedia();

        return () => {
            isMounted = false;
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
        };
    }, []);

    // Toggle Camera
    const toggleCam = async () => {
        if (!localStream) return;
        const newStatus = !isCamOn;
        setIsCamOn(newStatus);

        const videoTrack = localStream.getVideoTracks()[0];

        if (newStatus) {
            if (!videoTrack || videoTrack.readyState === 'ended') {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const newVideoTrack = newStream.getVideoTracks()[0];

                    if (videoTrack) {
                        videoTrack.stop();
                        localStream.removeTrack(videoTrack);
                    }
                    localStream.addTrack(newVideoTrack);

                    Object.values(peersRef.current).forEach((call: any) => {
                        const sender = call.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                        if (sender) sender.replaceTrack(newVideoTrack);
                    });
                } catch (e) {
                    console.error("Failed to restart video", e);
                    setIsCamOn(false);
                    return;
                }
            } else {
                videoTrack.enabled = true;
            }
        } else {
            if (videoTrack) videoTrack.stop();
        }
        socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'cam', value: newStatus }));
    };

    // Toggle Mic
    const toggleMic = () => {
        if (!localStream) return;
        const newStatus = !isMicOn;
        setIsMicOn(newStatus);
        localStream.getAudioTracks().forEach(t => t.enabled = newStatus);
        socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'mic', value: newStatus }));
    };

    // ─────────────────────────────────────────────────────────────
    // WebSocket & PeerJS Setup
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!CONFIG?.SERVER?.WS_URL || !roomId || !localStream) return;

        // Cleanup previous instances
        if (peerRef.current) peerRef.current.destroy();
        if (socketRef.current) socketRef.current.close();

        // ── Helper: call một peer cụ thể ──
        const callPeer = (targetId: string) => {
            if (!localStreamRef.current) return;
            if (peersRef.current[targetId]) return; // Đã call rồi, bỏ qua

            console.log(`[PeerJS] Calling ${targetId}`);
            const call = peerRef.current?.call(targetId, localStreamRef.current!);
            if (call) {
                peersRef.current[targetId] = call;
                call.on('stream', (remoteStream) => {
                    handleRemoteStream(targetId, remoteStream);
                });
                call.on('close', () => {
                    removeParticipant(targetId);
                });
                call.on('error', (err) => {
                    console.error(`[PeerJS] Call error with ${targetId}:`, err);
                });
            }
        };

        // ── Helper: xử lý stream từ peer ──
        const handleRemoteStream = (id: string, stream: MediaStream) => {
            console.log(`[PeerJS] Got stream from ${id}`);
            addParticipant(id, stream);
        };

        const addParticipant = (id: string, stream?: MediaStream) => {
            setParticipants(prev => {
                if (prev.find(p => p.id === id)) {
                    if (stream) return prev.map(p => p.id === id ? { ...p, stream } : p);
                    return prev;
                }
                return [...prev, { id, name: id, stream, cam: true, mic: true }];
            });
        };

        const removeParticipant = (id: string) => {
            setParticipants(prev => prev.filter(p => p.id !== id));
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
        };

        const updateParticipantState = (id: string, kind: 'cam' | 'mic', value: boolean) => {
            setParticipants(prev => prev.map(p => p.id === id ? { ...p, [kind]: value } : p));
        };

        // ── 1. Setup PeerJS với STUN servers rõ ràng ──
        const peer = new Peer(myId, {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            },
            debug: 2 // Log vừa đủ để debug
        });
        peerRef.current = peer;

        peer.on('error', (err) => {
            console.error("[PeerJS] Error:", err);
        });

        // Nhận cuộc gọi đến từ người khác
        peer.on('call', (call) => {
            console.log(`[PeerJS] Incoming call from ${call.peer}`);
            call.answer(localStreamRef.current!);
            peersRef.current[call.peer] = call;
            call.on('stream', (remoteStream) => {
                handleRemoteStream(call.peer, remoteStream);
            });
            call.on('close', () => {
                removeParticipant(call.peer);
            });
        });

        // ── 2. Kết nối WebSocket sau khi PeerJS sẵn sàng ──
        peer.on('open', (id) => {
            console.log('[PeerJS] My peer ID:', id);
            connectWebSocket();
        });

        const connectWebSocket = () => {
            const baseWsUrl = CONFIG.SERVER.WS_URL.endsWith('/') ? CONFIG.SERVER.WS_URL : `${CONFIG.SERVER.WS_URL}/`;
            const wsUrl = `${baseWsUrl}${roomId}/${myId}`;
            console.log('[WS] Connecting to', wsUrl);
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                setMessages(prev => [...prev, {
                    sender: 'System', text: t('welcomeMeeting'),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                }]);
                
                // Gửi config ngay khi connect
                socket.send(JSON.stringify({
                    type: 'config',
                    translate_mode: translateMode,
                    src_lang: speechLang === 'vi-VN' ? 'vi' : 'en',
                    target_lang: speechLang === 'vi-VN' ? 'vi' : 'en'
                }));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (e) { console.error('[WS] Parse error:', e); }
            };

            socket.onerror = (err) => {
                console.error('[WS] Error:', err);
            };
        };

        const handleWebSocketMessage = (data: any) => {
            console.log('[WS] Received:', data);
            switch (data.type) {

                // ── Nhận danh sách users đang có trong phòng khi mới join ──
                case 'room-info': {
                    const existingUsers: string[] = data.existing_users || [];
                    existingUsers.forEach((uid) => {
                        if (uid !== myId) {
                            addParticipant(uid); // Thêm vào UI trước
                            // Gọi ngay — họ sẽ trả lời (answer) cuộc gọi
                            setTimeout(() => callPeer(uid), 500);
                        }
                    });
                    break;
                }

                // ── Có người mới join phòng ──
                case 'user-joined':
                    if (data.user_id !== myId) {
                        console.log('[WS] user-joined:', data.user_id);
                        addParticipant(data.user_id);
                        // KHÔNG gọi ở đây — người mới sẽ nhận room-info và gọi chúng ta
                        setMessages(prev => [...prev, {
                            sender: 'System', text: `${data.user_id} joined`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                        }]);
                    }
                    break;

                // ── Có người rời phòng ──
                case 'user-left':
                    console.log('[WS] user-left:', data.user_id);
                    removeParticipant(data.user_id);
                    setMessages(prev => [...prev, {
                        sender: 'System', text: `${data.user_id} left`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                    }]);
                    break;

                // ── Tin nhắn chat ──
                case 'message':
                    setMessages(prev => [...prev, {
                        sender: data.user_id, text: data.message,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                    }]);
                    break;

                // ── Nhận bản dịch từ người khác ──
                case 'translated':
                    setRemoteCaptions({ text: data.content, sender: data.sender_id, isTranslated: true });
                    setTimeout(() => setRemoteCaptions(null), 7000);
                    break;
                    
                // ── Nhận text gốc từ người khác (nếu không bật dịch) ──
                case 'original':
                    setRemoteCaptions({ text: data.content, sender: data.sender_id, isTranslated: false });
                    setTimeout(() => setRemoteCaptions(null), 7000);
                    break;

                // ── Trạng thái mic/cam ──
                case 'device-toggle':
                    updateParticipantState(data.user_id, data.kind, data.value);
                    break;
            }
        };

        const cleanup = () => {
            socketRef.current?.close();
            peerRef.current?.destroy();
            participantsRef.current.forEach(p => p.stream?.getTracks().forEach(t => t.stop()));
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => {
                    t.enabled = false;
                    t.stop();
                });
            }
            stopListening();
        };

        window.addEventListener('beforeunload', cleanup);

        return () => {
            window.removeEventListener('beforeunload', cleanup);
            cleanup();
        };
    }, [roomId, localStream, stopListening]);

    const handleLeave = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.enabled = false;
                track.stop();
            });
        }
        if (localStream && localStream !== localStreamRef.current) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) socketRef.current.close();
        if (peerRef.current) peerRef.current.destroy();
        navigate('/');
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const msg = { type: 'message', message: messageInput };
        socketRef.current.send(JSON.stringify(msg));
        setMessages(prev => [...prev, {
            sender: 'You', text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true
        }]);
        setMessageInput('');
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
            <div className="flex-1 flex flex-col min-w-0 relative h-full">

                {/* Header */}
                <div className="absolute top-4 left-6 z-20 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold text-[10px] tracking-widest text-zinc-400 uppercase">{roomId}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2 text-blue-400">
                        <Signal className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold">{formatTime(meetingTime)}</span>
                    </div>
                </div>

                {/* Live Captions Overlay (Local User) */}
                {showCaptions && transcript && (
                    <div className="absolute bottom-40 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl max-w-3xl text-center border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">{transcript}</p>
                            <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest">
                                You ({language === 'en' ? 'EN' : 'VI'})
                            </p>
                        </div>
                    </div>
                )}

                {/* Remote Translated Captions (Người khác nói) */}
                {showCaptions && remoteCaptions && (
                    <div className="absolute bottom-40 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <div className="bg-blue-900/80 backdrop-blur-md px-6 py-4 rounded-2xl max-w-3xl text-center border border-blue-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">{remoteCaptions.text}</p>
                            <p className="text-[10px] text-blue-300 mt-2 uppercase tracking-widest flex items-center justify-center gap-1">
                                {remoteCaptions.sender} {remoteCaptions.isTranslated && <span className="text-yellow-400 text-[9px]">(Translated)</span>}
                            </p>
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden mt-12 mb-20">
                    <div className="w-full h-full flex flex-wrap gap-4 items-center justify-center content-center max-w-7xl mx-auto overflow-y-auto scrollbar-hide">

                        {/* Local User */}
                        <div className="relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-lg aspect-video w-full max-w-[480px]">
                            <VideoPlayer
                                stream={localStream}
                                isMirrored={true}
                                className={`w-full h-full object-cover ${isCamOn ? 'block' : 'hidden'}`}
                            />
                            {!isCamOn && <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 font-bold text-xl border border-white/5 shadow-2xl rounded-full w-16 h-16 m-auto">Y</div>}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                <span className="text-[11px] font-bold">You</span>
                                {!isMicOn && <MicOff className="w-3 h-3 text-red-500" />}
                            </div>
                        </div>

                        {/* Remote Participants */}
                        {participants.map((p) => (
                            <div key={p.id} className="relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-lg aspect-video w-full max-w-[480px]">
                                <VideoPlayer
                                    stream={p.stream}
                                    isMirrored={false}
                                    className={`w-full h-full object-cover ${p.cam && p.stream ? 'block' : 'hidden'}`}
                                />
                                {(!p.cam || !p.stream) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 font-bold text-xl border border-white/5 shadow-2xl rounded-full w-16 h-16 m-auto">
                                        {p.name[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <span className="text-[11px] font-bold text-zinc-200">{p.name}</span>
                                    {!p.mic && <MicOff className="w-3 h-3 text-red-500" />}
                                </div>
                                {/* Loading indicator khi chưa có stream */}
                                {!p.stream && (
                                    <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg">
                                        <span className="text-[10px] text-yellow-400 animate-pulse">Connecting...</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center px-8 z-30 pointer-events-none">
                    <div className="bg-[#121212]/90 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl mb-4 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isMicOn ? t('mute') : t('unmute')}>
                                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>
                            <button onClick={toggleCam} className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isCamOn ? t('stopVideo') : t('startVideo')}>
                                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-red-500/20">
                            <PhoneOff className="w-5 h-5" />
                            <span className="font-bold text-sm uppercase tracking-wider">{t('leave')}</span>
                        </button>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                {showLangMenu && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-zinc-900 border border-white/10 rounded-xl p-1 shadow-xl flex flex-col gap-1 w-32 animate-in slide-in-from-bottom-2">
                                        <button
                                            onClick={() => { setSpeechLang('vi-VN'); setShowLangMenu(false); }}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${speechLang === 'vi-VN' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                                        >
                                            Tiếng Việt
                                        </button>
                                        <button
                                            onClick={() => { setSpeechLang('en-US'); setShowLangMenu(false); }}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${speechLang === 'en-US' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                                        >
                                            English
                                        </button>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <button
                                            onClick={() => setTranslateMode(!translateMode)}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center ${translateMode ? 'text-green-400 bg-green-400/10' : 'text-zinc-400 hover:bg-white/5'}`}
                                        >
                                            <span>Auto-Translate</span>
                                            <span className="text-[10px] bg-black/50 px-1.5 rounded">{translateMode ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowCaptions(!showCaptions)}
                                    className={`p-4 rounded-l-2xl transition-all border-r border-white/5 ${showCaptions ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                    title={t('captions')}
                                >
                                    <Languages className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowLangMenu(!showLangMenu)}
                                    className={`p-4 rounded-r-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all border-l border-black/20`}
                                >
                                    <span className="text-[10px] font-bold uppercase">{speechLang === 'vi-VN' ? 'VI' : 'EN'}</span>
                                </button>
                            </div>
                            <button onClick={() => { setIsSidebarOpen(true); setActiveTab('chat'); }} className="p-4 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"><MessageSquare className="w-5 h-5" /></button>
                            <button onClick={() => { setIsSidebarOpen(true); setActiveTab('people'); }} className="p-4 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"><Users className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`bg-[#0a0a0a] border-l border-white/5 transition-all duration-500 flex flex-col relative z-40 shadow-2xl ${isSidebarOpen ? 'w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h3 className="font-bold text-lg tracking-tight uppercase text-zinc-500">{activeTab === 'chat' ? t('chat') : `${t('participants')} (${participants.length + 1})`}</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"><MoreVertical className="w-5 h-5 rotate-90" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {activeTab === 'chat' ? (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col gap-2 ${msg.isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                                <span className="text-[10px] font-bold text-zinc-500 px-1 uppercase tracking-widest">{msg.sender}</span>
                                <div className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] shadow-lg ${msg.isMe ? 'bg-white text-black rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'}`}>{msg.text}</div>
                            </div>
                        ))
                    ) : (
                        <div className="space-y-4">
                            {/* Bản thân */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">Y</div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-bold text-zinc-200">You</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        {isMicOn ? <Mic className="w-3 h-3 text-zinc-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                                        {isCamOn ? <Video className="w-3 h-3 text-zinc-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                                    </div>
                                </div>
                            </div>
                            {participants.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 border border-white/10">{p.name[0]?.toUpperCase()}</div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {p.mic ? <Mic className="w-3 h-3 text-zinc-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                                            {p.cam ? <Video className="w-3 h-3 text-zinc-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </div>
                                    {!p.stream && <span className="text-[10px] text-yellow-500 animate-pulse">Connecting...</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {activeTab === 'chat' && (
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="relative group">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={t('typeMessage')}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-zinc-600"
                            />
                            <button onClick={handleSendMessage} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
