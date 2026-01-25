
import { useState } from 'react';
import { LogIn, Key, History, ArrowRight, User } from 'lucide-react';

export const JoinMeeting = () => {
    const [roomId, setRoomId] = useState('');

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-2">
                    <LogIn className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Tham gia cuộc họp</h1>
                <p className="text-muted-foreground italic">Nhập mã phòng hoặc dán đường link cuộc họp của bạn.</p>
            </div>

            <div className="bg-card rounded-3xl border border-white/5 p-8 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Key className="w-32 h-32" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Mã phòng họp (Room ID)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                                <Key className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Vd: 592-183-402"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-lg tracking-wider"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Tên hiển thị của bạn</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Nhập tên của bạn..."
                                className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <button className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                    <span>Tham gia ngay</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">Gần đây</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">T</div>
                            <div>
                                <h4 className="font-bold text-sm">Thảo luận UI/UX</h4>
                                <p className="text-[10px] text-muted-foreground font-mono">ID: 882-103-112 • 2 giờ trước</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};
