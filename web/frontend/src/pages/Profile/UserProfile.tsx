import { useState } from 'react';
import { User, Mail, MapPin, Camera, Edit3, Shield, Award, Save, X } from 'lucide-react';

export const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userData] = useState({
        name: "Administrator",
        role: "Hệ thống / Quản trị viên",
        email: "admin.support@pro-max.com",
        phone: "N/A",
        location: "Hệ thống nội bộ",
        bio: "Tài khoản quản trị hệ thống Translartor ProMax. Quản lý cấu hình, người dùng và giám sát hiệu năng AI."
    });

    return (
        <div className="max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Cover Area */}
            <div className="relative h-48 md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Profile Info Card */}
            <div className="relative -mt-20 px-6">
                <div className="bg-card rounded-3xl border border-white/5 shadow-2xl p-6 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-500 p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <div className="w-full h-full rounded-[20px] bg-secondary flex items-center justify-center overflow-hidden border-4 border-card">
                                    <User className="w-16 h-16 text-muted-foreground" />
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight">{userData.name}</h1>
                                <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                                    {userData.role}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {userData.email}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {userData.location}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold flex items-center gap-2">
                                        <X className="w-4 h-4" /> Hủy
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-white/5 transition-all text-sm font-bold flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Lưu
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" /> Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/5">
                        {/* Stats / Badges */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Thành tích & Bảo mật</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        <span className="text-sm font-medium">Bảo mật 2 lớp</span>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-bold">ĐÃ BẬT</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-amber-400" />
                                        <span className="text-sm font-medium">Verified User</span>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tiểu sử</h3>
                            <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                "{userData.bio}"
                            </p>

                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-4">Hoạt động gần đây</h3>
                            <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-white/5">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500/20 border-4 border-card flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">14 giờ trước</p>
                                    <p className="font-medium text-sm">Đã tham gia cuộc họp: "Thiết kế UI Translartor"</p>
                                </div>
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-500/20 border-4 border-card flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">Hôm qua</p>
                                    <p className="font-medium text-sm">Đã cập nhật cấu hình API Server</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for simplicity
const CheckCircle = ({ className }: { className?: string }) => (
    <div className={className}>
        <div className="w-5 h-5 rounded-full bg-current opacity-20 absolute" />
        <Save className="w-3 h-3 translate-x-1 translate-y-1" />
    </div>
);
