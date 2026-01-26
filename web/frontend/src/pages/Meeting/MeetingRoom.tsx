
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, Users, MoreVertical, Send, Captions, Volume2, VolumeX, UserMinus, Signal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export const MeetingRoom = () => {
    const { t, CONFIG } = useConfig();
    const navigate = useNavigate();
    const { id: roomId } = useParams();
    
    const socketRef = useRef<WebSocket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Meeting States
    const [meetingTime, setMeetingTime] = useState(0);
    const [isHost] = useState(true); 
    
    // UI States
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string, isMe: boolean }[]>([]);
    const [participants, setParticipants] = useState([
        { id: 'u1', name: 'Sarah Connor', cam: true, mic: true },
        { id: 'u2', name: 'John Doe', cam: true, mic: false },
        { id: 'u3', name: 'Kyle Reese', cam: false, mic: true },
    ]);

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

    // Media
    useEffect(() => {
        const initMedia = async () => {
            try {
                if (localStream) localStream.getTracks().forEach(track => track.stop());
                if (isCamOn || isMicOn) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: isCamOn, audio: true });
                    setLocalStream(stream);
                    if (localVideoRef.current && isCamOn) localVideoRef.current.srcObject = stream;
                    stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
                }
            } catch (err) { console.error(err); }
        };
        initMedia();
        return () => localStream?.getTracks().forEach(track => track.stop());
    }, [isCamOn]);

    useEffect(() => {
        if (localStream) localStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
    }, [isMicOn, localStream]);

    // WebSocket
    useEffect(() => {
        if (!CONFIG?.SERVER?.WS_URL || !roomId) return;
        const baseWsUrl = CONFIG.SERVER.WS_URL.endsWith('/') ? CONFIG.SERVER.WS_URL : `${CONFIG.SERVER.WS_URL}/`;
        const wsUrl = `${baseWsUrl}${roomId}/user_${Math.floor(Math.random() * 1000)}`;
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
                if (data.type === 'message') {
                    setMessages(prev => [...prev, {
                        sender: data.user_id.split('_')[0], text: data.message,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false
                    }]);
                }
            } catch (e) { console.error(e); }
        };
        return () => socket.close();
    }, [roomId, CONFIG?.SERVER?.WS_URL]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const chatData = { type: 'message', message: messageInput, timestamp: new Date().toISOString() };
        socketRef.current.send(JSON.stringify(chatData));
        setMessages(prev => [...prev, { sender: t('you'), text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }]);
        setMessageInput('');
    };

    const handleKick = (id: string, name: string) => {
        if (confirm(t('kickConfirm').replace('{name}', name))) {
            setParticipants(prev => prev.filter(p => p.id !== id));
        }
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

                {/* Video Area */}
                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden mt-12 mb-20">
                    <div className={`w-full h-full flex gap-4 transition-all duration-500 max-w-7xl mx-auto ${isSharing ? 'flex-row' : 'flex-col items-center justify-center'}`}>
                        {isSharing && (
                            <div className="flex-[3] relative bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl aspect-video group">
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/50">
                                    <Monitor className="w-20 h-20 text-blue-500 opacity-20 mb-4" />
                                    <p className="text-sm font-bold text-blue-400 tracking-widest uppercase animate-pulse">{t('presentingScreen')}</p>
                                </div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">Y</div>
                                    <span className="text-sm font-bold">{t('yourScreen')}</span>
                                </div>
                            </div>
                        )}

                        <div className={`transition-all duration-500 overflow-y-auto scrollbar-hide p-1 ${isSharing ? 'flex-1 flex flex-col gap-3 max-h-full' : 'w-full flex flex-wrap gap-4 items-center justify-center content-center'}`}>
                            {/* Local User */}
                            <div className={`relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-lg aspect-video transition-all duration-300 ${isSharing ? 'w-full shrink-0' : 'w-full max-w-[480px]'}`}>
                                <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] ${isCamOn ? 'block' : 'hidden'}`} />
                                {!isCamOn && <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 font-bold text-xl border border-white/5 shadow-2xl rounded-full w-16 h-16 m-auto">Y</div>}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <span className="text-[11px] font-bold">{t('you')} ({t('host')})</span>
                                    {!isMicOn && <MicOff className="w-3 h-3 text-red-500" />}
                                </div>
                            </div>

                            {/* Remote Participants */}
                            {participants.map((p) => (
                                <div key={p.id} className={`relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-lg aspect-video transition-all duration-300 ${isSharing ? 'w-full shrink-0' : 'w-full max-w-[480px]'}`}>
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                        {p.cam ? <div className="text-[10px] text-zinc-600 uppercase tracking-widest opacity-20 italic">Remote Stream</div> : <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-xl border border-white/5">{p.name[0]}</div>}
                                    </div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                        <span className="text-[11px] font-bold text-zinc-200">{p.name}</span>
                                        {!p.mic && <MicOff className="w-3 h-3 text-red-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center px-8 z-30 pointer-events-none">
                    <div className="bg-[#121212]/90 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl mb-4 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isMicOn ? t('mute') : t('unmute')}><Mic className="w-5 h-5" /></button>
                            <button onClick={() => setIsCamOn(!isCamOn)} className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} title={isCamOn ? t('stopVideo') : t('startVideo')}><Video className="w-5 h-5" /></button>
                            <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={`p-4 rounded-2xl transition-all ${isSpeakerOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-600 text-zinc-400'}`} title={isSpeakerOn ? t('speakerOff') : t('speakerOn')}>{isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <button onClick={() => setIsSharing(!isSharing)} className={`p-4 rounded-2xl transition-all ${isSharing ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-zinc-800 hover:bg-zinc-700'}`} title={t('shareScreen')}><Monitor className="w-5 h-5" /></button>
                        <button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-red-500/20"><PhoneOff className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wider">{t('leave')}</span></button>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setIsSidebarOpen(true); setActiveTab('chat'); }} className={`p-4 rounded-2xl transition-all ${isSidebarOpen && activeTab === 'chat' ? 'bg-white text-black shadow-xl' : 'bg-zinc-800 text-zinc-400'}`} title={t('chat')}><MessageSquare className="w-5 h-5" /></button>
                            <button onClick={() => { setIsSidebarOpen(true); setActiveTab('people'); }} className={`p-4 rounded-2xl transition-all ${isSidebarOpen && activeTab === 'people' ? 'bg-white text-black shadow-xl' : 'bg-zinc-800 text-zinc-400'}`} title={t('participants')}><Users className="w-5 h-5" /></button>
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
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 border border-white/10">Y</div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-bold text-zinc-200">{t('you')} ({t('host')})</span>
                                    <span className="text-[10px] text-blue-500 font-bold uppercase">Admin</span>
                                </div>
                            </div>
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
                                    {isHost && (
                                        <button onClick={() => handleKick(p.id, p.name)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-lg" title={t('kickOut')}>
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
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
