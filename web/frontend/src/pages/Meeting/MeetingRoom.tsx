
import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, Users, MoreVertical, Settings, Send, Captions } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export const MeetingRoom = () => {
    const { t } = useConfig();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('id');

    // UI States
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string }[]>([
        { sender: 'System', text: 'Welcome to the meeting!', time: '10:00' }
    ]);

    const toggleSidebar = (tab: 'chat' | 'people') => {
        if (isSidebarOpen && activeTab === tab) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
            setActiveTab(tab);
        }
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;
        setMessages([...messages, { sender: 'You', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setMessage('');
    };

    const handleEndCall = () => {
        if (confirm("Bạn có chắc chắn muốn kết thúc cuộc gọi?")) {
            navigate('/');
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                
                {/* Header (Optional, fades out usually) */}
                <div className="h-14 flex items-center justify-between px-6 bg-transparent absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide opacity-80">{roomId || 'Meeting Room'}</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-2" />
                        <span className="text-xs font-mono opacity-60">REC</span>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {/* My Video */}
                    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 ring-1 ring-white/5 group">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {isCamOn ? (
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80" alt="Me" className="w-full h-full object-cover opacity-90" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold">Y</div>
                            )}
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
                            {t('you')} {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
                        </div>
                        {/* Audio visualizer effect */}
                        {isMicOn && <div className="absolute bottom-4 right-4 flex gap-1 h-4 items-end">
                            {[1,2,3].map(i => <div key={i} className="w-1 bg-green-500 rounded-full animate-bounce" style={{height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s`}} />)}
                        </div>}
                    </div>

                    {/* Participant 1 */}
                    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=800&q=80" alt="User" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-medium">
                            Sarah Connor
                        </div>
                    </div>

                    {/* Participant 2 - Waiting */}
                    <div className="relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                            <Users className="w-6 h-6 opacity-50" />
                        </div>
                        <span className="text-sm">{t('waitingForOthers')}</span>
                    </div>
                </div>

                {/* Captions Area */}
                <div className="h-16 px-8 flex items-center justify-center text-center">
                    <p className="bg-black/60 backdrop-blur px-6 py-2 rounded-xl text-lg font-medium text-yellow-300 transition-all cursor-default hover:bg-black/80">
                        <span className="opacity-50 mr-2 text-white">Sarah:</span>
                        Hello everyone, can you hear me clearly?
                    </p>
                </div>

                {/* Control Bar */}
                <div className="h-20 bg-zinc-900/90 backdrop-blur-lg border-t border-white/5 px-4 flex items-center justify-between shrink-0">
                    {/* Left: Time & Code */}
                    <div className="hidden md:flex flex-col">
                        <span className="font-bold text-lg">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-xs text-zinc-400 font-mono">{roomId}</span>
                    </div>

                    {/* Center: Main Controls */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            title={isMicOn ? t('mute') : t('unmute')}
                        >
                            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                        <button 
                            onClick={() => setIsCamOn(!isCamOn)}
                            className={`p-4 rounded-full transition-all ${isCamOn ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            title={isCamOn ? t('stopVideo') : t('startVideo')}
                        >
                            {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                        
                        <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all text-blue-400" title={t('captions')}>
                            <Captions className="w-5 h-5" />
                        </button>

                        <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all" title={t('shareScreen')}>
                            <Monitor className="w-5 h-5" />
                        </button>

                        <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all" title={t('moreOptions')}>
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        <button 
                            onClick={handleEndCall}
                            className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all ml-2" 
                            title={t('endCall')}
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Right: Sidebar Toggles */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => toggleSidebar('chat')}
                            className={`p-3 rounded-xl transition-all ${isSidebarOpen && activeTab === 'chat' ? 'bg-blue-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => toggleSidebar('people')}
                            className={`p-3 rounded-xl transition-all ${isSidebarOpen && activeTab === 'people' ? 'bg-blue-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`bg-zinc-900 border-l border-white/5 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold">{activeTab === 'chat' ? t('chat') : t('participants')}</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="hover:bg-zinc-800 p-1 rounded">
                        <MoreVertical className="w-4 h-4 rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'chat' ? (
                        <>
                            {messages.map((msg, idx) => (
                                <div key={idx} className="flex flex-col gap-1 animate-in slide-in-from-bottom-2">
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-bold text-xs text-zinc-400">{msg.sender}</span>
                                        <span className="text-[10px] text-zinc-600">{msg.time}</span>
                                    </div>
                                    <div className={`p-3 rounded-xl text-sm ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="space-y-4">
                            {['You (Host)', 'Sarah Connor', 'John Doe'].map((name, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                                        {name[0]}
                                    </div>
                                    <span className="text-sm font-medium">{name}</span>
                                    {i === 0 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Me</span>}
                                    <div className="ml-auto flex gap-2">
                                        <MicOff className="w-3 h-3 text-red-400" />
                                        <Video className="w-3 h-3 text-green-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {activeTab === 'chat' && (
                    <div className="p-4 border-t border-white/5 bg-zinc-900">
                        <div className="relative">
                            <input 
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={t('typeMessage')}
                                className="w-full bg-zinc-800 border-none rounded-full pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
