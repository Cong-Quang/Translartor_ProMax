
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Shield, Users, Sparkles, ArrowRight, Lock, Copy, Check } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const MeetingNew = () => {
    const { t } = useConfig();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [enableAI, setEnableAI] = useState(true);
    const [loading, setLoading] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateRoomId = () => {
        const part = () => Math.floor(Math.random() * 900 + 100).toString();
        return `${part()}-${part()}-${part()}`;
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            alert(t('fillAllFields'));
            return;
        }

        setLoading(true);
        const newRoomId = generateRoomId();

        try {
            // Thông báo cho Server về phòng mới (Tùy chọn)
            // await fetch(`${serverUrl}/create-room`, {
            //     method: 'POST',
            //     body: JSON.stringify({ id: newRoomId, name: roomName })
            // });
            
            // Giả lập delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setCreatedRoomId(newRoomId);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (createdRoomId) {
            navigator.clipboard.writeText(createdRoomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (createdRoomId) {
        return (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <Check className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-2">{t('roomCreated')}</h2>
                    <p className="text-muted-foreground">{t('tipShare')}</p>
                </div>
                
                <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t('roomId')}</div>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-mono font-bold tracking-wider text-primary">{createdRoomId}</span>
                        <button onClick={copyToClipboard} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-muted-foreground" />}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => navigate(`/check?room=${createdRoomId}`)}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
                >
                    {t('joinNow')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{t('startMeeting')}</h1>
                <p className="text-muted-foreground">{t('startMeetingDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 bg-card rounded-2xl border border-border space-y-4 shadow-sm">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('roomName')}</label>
                            <input
                                type="text"
                                placeholder={t('roomNamePlaceholder')}
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-300 ${isPrivate ? 'bg-blue-500/5 border-blue-500/30' : 'bg-muted/20 border-border'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${isPrivate ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{t('privateRoom')}</p>
                                        <p className="text-xs text-muted-foreground">{t('privateRoomDesc')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPrivate(!isPrivate)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-blue-500' : 'bg-muted'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                            
                            {isPrivate && (
                                <div className="mt-4 relative animate-in slide-in-from-top-2">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('enterPassword')}
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${enableAI ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-400'}`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{t('aiSupport')}</p>
                                    <p className="text-xs text-muted-foreground">{t('aiSupportDesc')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEnableAI(!enableAI)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${enableAI ? 'bg-purple-500' : 'bg-muted'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enableAI ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Video className="w-5 h-5" />
                        )}
                        <span>{loading ? t('creating') : t('createAndJoin')}</span>
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-secondary/20 rounded-2xl border border-border sticky top-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            {t('quickTips')}
                        </h3>
                        <ul className="space-y-3 text-xs text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>{t('tipShare')}</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>{t('tipAI')}</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>{t('tipSettings')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
