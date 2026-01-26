
import { useState, useEffect } from 'react';
import { LogIn, Key, History, ArrowRight, User, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { supabase, isSupabaseConfigured } from '../../supabase';
import type { Room } from '../../supabase';

export const JoinMeeting = () => {
    const { t } = useConfig();
    const [searchParams] = useSearchParams();
    
    const [roomId, setRoomId] = useState(searchParams.get('id') || '');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    
    // Auth state
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [roomData, setRoomData] = useState<Room | null>(null);

    const checkRoom = async () => {
        if (!isSupabaseConfigured) return;
        if (!roomId.trim()) return;
        
        setChecking(true);
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', roomId)
                .single();

            if (error || !data) {
                alert(t('roomNotFound'));
                setRoomData(null);
                setRequirePassword(false);
            } else {
                setRoomData(data as Room);
                if (data.is_private) {
                    setRequirePassword(true);
                } else {
                    // alert(`Tham gia thành công phòng: ${data.name}`);
                }
            }
        } catch (err) {
            console.error(err);
            alert(t('errorOccurred'));
        } finally {
            setChecking(false);
        }
    };

    const handleJoin = async () => {
        if (!isSupabaseConfigured) {
            alert("Vui lòng cấu hình Supabase trước.");
            return;
        }

        if (!roomId.trim() || !displayName.trim()) {
            alert(t('fillAllFields'));
            return;
        }

        if (requirePassword) {
            if (!password.trim()) {
                alert(t('fillAllFields'));
                return;
            }
            if (password !== roomData?.password) {
                alert(t('wrongPassword'));
                return;
            }
        }

        // Nếu chưa check room (trường hợp user nhập ID xong ấn Enter luôn)
        if (!roomData) {
            await checkRoom();
            return; 
        }

        // Logic tham gia thành công
        alert(`Tham gia thành công!\nPhòng: ${roomData.name}\nTên bạn: ${displayName}`);
        // Navigate logic here...
    };

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-2">
                    <LogIn className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t('joinMeeting')}</h1>
                <p className="text-muted-foreground italic">{t('joinMeetingDesc')}</p>
            </div>

            {!isSupabaseConfigured && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <div className="text-sm text-left">
                        <p className="font-bold">{t('supabaseMissing')}</p>
                        <p className="opacity-80">{t('supabaseFix')}</p>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-3xl border border-white/5 p-8 shadow-2xl space-y-8 relative overflow-hidden">
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
                                    setRequirePassword(false); // Reset state khi đổi ID
                                    setRoomData(null);
                                }}
                                onBlur={checkRoom} // Tự động check khi rời ô input
                                className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-lg tracking-wider"
                            />
                            {checking && (
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                </div>
                            )}
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
                                className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Input (Conditional) */}
                    <div className={`grid transition-all duration-500 ease-in-out ${requirePassword ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden space-y-2">
                            <label className="text-sm font-medium text-blue-400 ml-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> 
                                {t('enterPassword')}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-blue-500/5 border border-blue-500/30 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleJoin}
                    disabled={loading || checking}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                    <span>{t('joinNow')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* History Section (Static Demo) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t('recent')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">T</div>
                            <div>
                                <h4 className="font-bold text-sm">Thảo luận UI/UX</h4>
                                <p className="text-[10px] text-muted-foreground font-mono">ID: 882-103-112 • 2h ago</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};
