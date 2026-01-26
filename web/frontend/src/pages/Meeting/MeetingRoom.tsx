

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, MoreVertical, Send, Signal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import Peer from 'peerjs';

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

export const MeetingRoom = () => {
    const { t, CONFIG } = useConfig();
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

    // Media States
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    // const [isSharing, setIsSharing] = useState(false); // Screen share deferred

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

                // Apply initial state
                stream.getVideoTracks().forEach(t => t.enabled = isCamOn);
                stream.getAudioTracks().forEach(t => t.enabled = isMicOn);

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
                    track.enabled = false;
                });
            }
        };
    }, []);

    // Toggle Media Tracks
    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(t => t.enabled = isCamOn);
            // Notify others
            socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'cam', value: isCamOn }));
        }
    }, [isCamOn]);

    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMicOn);
            // Notify others
            socketRef.current?.send(JSON.stringify({ type: 'device-toggle', kind: 'mic', value: isMicOn }));
        }
    }, [isMicOn]);

    // WebSocket & PeerJS Setup
    useEffect(() => {
        if (!CONFIG?.SERVER?.WS_URL || !roomId || !localStream) return;

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
                    // User joined, call them!
                    if (data.user_id !== myId) {
                        const call = peerRef.current?.call(data.user_id, localStream);
                        if (call) {
                            peersRef.current[data.user_id] = call;
                            call.on('stream', (remoteStream) => {
                                handleRemoteStream(data.user_id, remoteStream);
                            });
                        }
                        // Add to participants list preliminarily
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
        };
    }, [roomId, localStream]); // Wait for localStream before setting up peer

    const handleSendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const msg = { type: 'message', message: messageInput };
        socketRef.current.send(JSON.stringify(msg));
        setMessages(prev => [...prev, { sender: 'You', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }]);
        setMessageInput('');
    };



    // Helper to render video
    // IMPORTANT: React requires us to attach the stream to the video element manually via ref or specific effect
    // We will create a small sub-component or just use a callback ref pattern.

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

                {/* Video Grid */}
                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden mt-12 mb-20">
                    <div className="w-full h-full flex flex-wrap gap-4 items-center justify-center content-center max-w-7xl mx-auto overflow-y-auto scrollbar-hide">

                        {/* Local User */}
                        <div className="relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-lg aspect-video w-full max-w-[480px]">
                            <video
                                ref={el => { if (el && localStream) el.srcObject = localStream; }}
                                autoPlay muted playsInline
                                className={`w-full h-full object-cover transform scale-x-[-1] ${isCamOn ? 'block' : 'hidden'}`}
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
                                <video
                                    ref={el => { if (el && p.stream) el.srcObject = p.stream; }}
                                    autoPlay playsInline
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
                            <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isMicOn ? t('mute') : t('unmute')}><Mic className="w-5 h-5" /></button>
                            <button onClick={() => setIsCamOn(!isCamOn)} className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isCamOn ? t('stopVideo') : t('startVideo')}><Video className="w-5 h-5" /></button>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-red-500/20"><PhoneOff className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wider">{t('leave')}</span></button>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
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
