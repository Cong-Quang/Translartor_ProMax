
import { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { CONFIG } from '../../config';
import { Settings, Palette, Globe, Server, ShieldCheck, Check, Moon, Sun, Monitor, Laptop } from 'lucide-react';

export const SettingsPage = () => {
    const { theme, setTheme, language, setLanguage, serverUrl, setServerUrl } = useConfig();
    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'network' | 'admin'>('general');

    const themes = [
        { id: 'dark', name: 'Tối', icon: Moon, colors: 'bg-slate-950' },
        { id: 'light', name: 'Sáng', icon: Sun, colors: 'bg-white' },
        { id: 'system', name: 'Hệ thống', icon: Monitor, colors: 'bg-slate-500' },
        { id: 'blue', name: 'Xanh biển', icon: Laptop, colors: 'bg-blue-900' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Cài đặt hệ thống</h1>
                    <p className="text-muted-foreground">Tùy chỉnh trải nghiệm theo cách của bạn.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'general' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">Chung</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        <Palette className="w-4 h-4" />
                        <span className="font-medium">Giao diện</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'network' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        <Server className="w-4 h-4" />
                        <span className="font-medium">Máy chủ</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Quản trị</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-card rounded-3xl border border-white/5 p-8 min-h-[400px]">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">Ngôn ngữ hiển thị</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CONFIG.LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as any)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang.code ? 'border-primary bg-primary/10 shadow-md' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center font-bold text-xs">
                                                {lang.code.toUpperCase()}
                                            </div>
                                            <span className="font-semibold">{lang.name}</span>
                                        </div>
                                        {language === lang.code && <Check className="w-5 h-5 text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">Chế độ hiển thị</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {themes.map((t) => {
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id as any)}
                                            className={`group flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all ${theme === t.id ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.colors} ${t.id === 'light' ? 'text-black border border-black/10' : 'text-white'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-sm">{t.name}</span>
                                            {theme === t.id && <div className="p-1 bg-primary rounded-full"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-8 space-y-4">
                                <h3 className="text-xl font-bold">Hình nền</h3>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-muted-foreground text-sm">
                                    Tính năng đổi hình nền tùy chỉnh đang được phát triển...
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">Cấu hình kết nối</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Địa chỉ API Server</label>
                                    <input
                                        type="text"
                                        value={serverUrl}
                                        onChange={(e) => setServerUrl(e.target.value)}
                                        className="w-full bg-secondary/30 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                        placeholder="http://localhost:8000"
                                    />
                                </div>
                                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 text-xs leading-relaxed">
                                    Lưu ý: Thay đổi địa chỉ máy chủ có thể làm gián đoạn kết nối hiện tại. Hãy đảm bảo địa chỉ máy chủ khả dụng trước khi áp dụng.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">Tài khoản Quản trị</h3>
                            <div className="p-6 bg-secondary/20 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-muted-foreground text-sm">Quản trị viên:</span>
                                    <span className="font-mono text-sm">{CONFIG.ADMIN.ID}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-muted-foreground text-sm">Mật khẩu:</span>
                                    <span className="font-mono text-sm">********</span>
                                </div>
                                <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                                    Đổi mật khẩu bảo mật
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
