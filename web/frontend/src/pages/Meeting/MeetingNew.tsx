
import { useState } from 'react';
import { Video, Shield, Users, Sparkles, ArrowRight } from 'lucide-react';

export const MeetingNew = () => {
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [enableAI, setEnableAI] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Bắt đầu cuộc họp mới</h1>
                <p className="text-muted-foreground">Thiết lập nhanh chóng và chia sẻ link cho mọi người.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 bg-card rounded-2xl border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Tên phòng họp</label>
                            <input
                                type="text"
                                placeholder="Vd: Thảo luận dự án Web..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Phòng riêng tư</p>
                                    <p className="text-xs text-muted-foreground">Yêu cầu mật khẩu để tham gia</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-blue-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Hỗ trợ AI (Real-time)</p>
                                    <p className="text-xs text-muted-foreground">Tự động dịch và tạo phụ đề</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEnableAI(!enableAI)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${enableAI ? 'bg-purple-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enableAI ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                        <Video className="w-5 h-5" />
                        <span>Tạo và tham gia ngay</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Right: Quick Info */}
                <div className="space-y-4">
                    <div className="p-6 bg-secondary/20 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Mẹo nhanh
                        </h3>
                        <ul className="space-y-3 text-xs text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Chia sẻ mã phòng cho đồng nghiệp để họ tham gia.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Bật AI để trải nghiệm dịch từ tiếng Anh sang Việt tức thì.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Bạn có thể tùy chỉnh mic và loa sau khi vào phòng.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
