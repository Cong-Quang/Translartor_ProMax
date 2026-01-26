
import { useState } from 'react';
import { LogIn, Key, History, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export const JoinMeeting = () => {
    const { t, serverUrl } = useConfig();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [roomId, setRoomId] = useState(searchParams.get('id') || '');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!roomId.trim()) {
            alert(t('fillAllFields'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Gửi yêu cầu kiểm tra phòng tới Backend
            const response = await fetch(`${serverUrl}/validate-room/${roomId}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.active) {
                    navigate(`/check?room=${roomId}&name=${encodeURIComponent(displayName)}`);
                } else {
                    setError(t('roomNotFound'));
                }
            } else {
                // Nếu server trả lỗi (ví dụ 404), vẫn cho phép vào trong môi trường demo
                console.warn("Server validation failed, proceeding anyway for demo.");
                navigate(`/check?room=${roomId}&name=${encodeURIComponent(displayName)}`);
            }
        } catch (err) {
            console.error("Lỗi kết nối server:", err);
            // Cho phép vào ngay cả khi không có server (để test giao diện)
            navigate(`/check?room=${roomId}&name=${encodeURIComponent(displayName)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="text-center space-y-1">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-1">
                    <LogIn className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t('joinMeeting')}</h1>
                <p className="text-muted-foreground italic text-sm">{t('joinMeetingDesc')}</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Key className="w-32 h-32" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">{t('roomId')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                                <Key className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('roomIdPlaceholder')}
                                value={roomId}
                                onChange={(e) => {
                                    setRoomId(e.target.value);
                                    setError(null);
                                }}
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-lg tracking-wider"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">{t('displayName')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t('displayNamePlaceholder')}
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{t('joinNow')}</span>}
                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>

            {/* History Section (Static Demo) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t('recent')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div 
                        onClick={() => setRoomId('882-103-112')}
                        className="p-4 bg-card rounded-2xl border border-border flex items-center justify-between hover:bg-muted transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs shadow-inner">T</div>
                            <div>
                                <h4 className="font-bold text-sm">Thảo luận UI/UX</h4>
                                <p className="text-[10px] text-muted-foreground font-mono">ID: 882-103-112 • 2h ago</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};
