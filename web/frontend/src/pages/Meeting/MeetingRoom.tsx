
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
            muted={isMirrored} // Local stream usually muted
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

    const [myId] = useState(`user_${Math.floor(Math.random() * 10000)}`);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Refs for persistence in callbacks
    const participantsRef = useRef<Participant[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Record<string, any>>({}); // Keep track of PeerJS calls

    // UI States
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [meetingTime, setMeetingTime] = useState(0);
    const [showCaptions, setShowCaptions] = useState(false);

    // Media States
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    // Speech Recognition
    const [speechLang, setSpeechLang] = useState(language === 'en' ? 'en-US' : 'vi-VN');
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Update speech lang if app language changes (optional sync)
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

    // Auto-hide transcript after 5 seconds of invariance
    useEffect(() => {
        if (!transcript) return;

        const timer = setTimeout(() => {
            resetTranscript();
        }, 5000);

        return () => clearTimeout(timer);
    }, [transcript, resetTranscript]);

    // Sync speech recognition with mic status and captions toggle
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize Local Media
    useEffect(() => {
        const initMedia = async () => {
            try {
                // Get initial stream with both on
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localStreamRef.current = stream;
            } catch (err) {
                console.error("Error accessing media:", err);
                // Handle error (maybe request permissions again or show alert)
            }
        };
        initMedia();

        return () => {
            // Cleanup media on unmount
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
            }
        };
    }, []);

    // Toggle Camera (Hardware Stop/Start)
    const toggleCam = async () => {
        if (!localStream) return;
        const newStatus = !isCamOn;
        setIsCamOn(newStatus);

        const videoTrack = localStream.getVideoTracks()[0];

        if (newStatus) {
            // Turn ON: If track is missing or stopped, re-acquire
            if (!videoTrack || videoTrack.readyState === 'ended') {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const newVideoTrack = newStream.getVideoTracks()[0];

                    // Replace track in local stream
                    if (videoTrack) {
                        localStream.removeTrack(videoTrack);
                    }
                    localStream.addTrack(newVideoTrack);

                    // Replace track in peer connections
                    Object.values(peersRef.current).forEach((call: any) => {
                        const sender = call.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(newVideoTrack);
                        }
                    });
                } catch (e) {
                    console.error("Failed to restart video", e);
                    setIsCamOn(false); // Revert if failed
                    return;
                }
            } else {
                videoTrack.enabled = true;
            }
        } else {
            // Turn OFF: Stop the track to kill light
            if (videoTrack) {
                videoTrack.stop();
            }
        }

        socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'cam', value: newStatus }));
    };

    // Toggle Mic (Mute/Unmute)
    const toggleMic = () => {
        if (!localStream) return;
        const newStatus = !isMicOn;
        setIsMicOn(newStatus);

        localStream.getAudioTracks().forEach(t => t.enabled = newStatus);
        socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'mic', value: newStatus }));
    };

    // WebSocket & PeerJS Setup
    useEffect(() => {
        if (!CONFIG?.SERVER?.WS_URL || !roomId || !localStream) return;

        // Cleanup previous if exists
        if (peerRef.current) peerRef.current.destroy();
        if (socketRef.current) socketRef.current.close();

        // 1. Setup PeerJS
        // Use local user ID as Peer ID for simplicity
        const peer = new Peer(myId);
        peerRef.current = peer;

        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            // Now connect to WS
            connectWebSocket();
        });

        peer.on('call', (call) => {
            // Answer incoming call with our stream
            console.log("Receiving call from", call.peer);
            call.answer(localStream);

            call.on('stream', (remoteStream) => {
                handleRemoteStream(call.peer, remoteStream);
            });

            peersRef.current[call.peer] = call;
        });

        peer.on('error', (err) => {
            console.error("PeerJS Error:", err);
        });

        const connectWebSocket = () => {
            const baseWsUrl = CONFIG.SERVER.WS_URL.endsWith('/') ? CONFIG.SERVER.WS_URL : `${CONFIG.SERVER.WS_URL}/`;
            // Using the new path structure
            const wsUrl = `${baseWsUrl}${roomId}/${myId}`;
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                setMessages(prev => [...prev, {
                    sender: 'System', text: t('welcomeMeeting'),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                }]);
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (e) { console.error(e); }
            };
        };

        const handleWebSocketMessage = (data: any) => {
            switch (data.type) {
                case 'user-joined':
                    if (data.user_id !== myId) {
                        console.log("Calling new user:", data.user_id);
                        const call = peerRef.current?.call(data.user_id, localStream);
                        if (call) {
                            peersRef.current[data.user_id] = call;
                            call.on('stream', (remoteStream) => {
                                handleRemoteStream(data.user_id, remoteStream);
                            });
                        }
                        addParticipant(data.user_id);
                        setMessages(prev => [...prev, {
                            sender: 'System', text: `${data.user_id} joined`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                        }]);
                    }
                    break;

                case 'user-left':
                    removeParticipant(data.user_id);
                    setMessages(prev => [...prev, {
                        sender: 'System', text: `${data.user_id} left`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                    }]);
                    break;

                case 'message':
                    setMessages(prev => [...prev, {
                        sender: data.user_id, text: data.message,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                    }]);
                    break;

                case 'device-toggle':
                    updateParticipantState(data.user_id, data.kind, data.value);
                    break;
            }
        };

        const addParticipant = (id: string, stream?: MediaStream) => {
            setParticipants(prev => {
                if (prev.find(p => p.id === id)) {
                    if (stream) {
                        return prev.map(p => p.id === id ? { ...p, stream } : p);
                    }
                    return prev;
                }
                return [...prev, { id, name: id, stream, cam: true, mic: true }];
            });
        };

        const handleRemoteStream = (id: string, stream: MediaStream) => {
            addParticipant(id, stream);
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

        return () => {
            socketRef.current?.close();
            peerRef.current?.destroy();
            participantsRef.current.forEach(p => p.stream?.getTracks().forEach(t => t.stop()));
            stopListening();
        };
    }, [roomId, localStream]); // Wait for localStream before setting up peer

    const handleSendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const msg = { type: 'message', message: messageInput };
        socketRef.current.send(JSON.stringify(msg));
        setMessages(prev => [...prev, { sender: 'You', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }]);
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

                {/* Live Captions Overlay */}
                {showCaptions && transcript && (
                    <div className="absolute bottom-32 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl max-w-3xl text-center border border-white/10 shadow-2xl animate-in slide-in-from-bottom-5">
                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                                {transcript}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest">
                                {t('captions')} • {language === 'en' ? 'English' : 'Tiếng Việt'}
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
                                    className={`w-full h-full object-cover ${p.cam ? 'block' : 'hidden'}`}
                                />
                                {!p.cam && <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 font-bold text-xl border border-white/5 shadow-2xl rounded-full w-16 h-16 m-auto">{p.name[0]}</div>}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <span className="text-[11px] font-bold text-zinc-200">{p.name}</span>
                                    {!p.mic && <MicOff className="w-3 h-3 text-red-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center px-8 z-30 pointer-events-none">
                    <div className="bg-[#121212]/90 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl mb-4 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isMicOn ? t('mute') : t('unmute')}><Mic className="w-5 h-5" /></button>
                            <button onClick={toggleCam} className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isCamOn ? t('stopVideo') : t('startVideo')}><Video className="w-5 h-5" /></button>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-red-500/20"><PhoneOff className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wider">{t('leave')}</span></button>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            {/* Captions Toggle */}
                            {/* Captions Toggle & Language */}
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
                            {participants.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 border border-white/10">{p.name[0]}</div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {p.mic ? <Mic className="w-3 h-3 text-zinc-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                                            {p.cam ? <Video className="w-3 h-3 text-zinc-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {activeTab === 'chat' && (
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="relative group">
                            <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t('typeMessage')} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-zinc-600" />
                            <button onClick={handleSendMessage} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"><Send className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
