import { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { CONFIG } from '../../config';
import { Settings, Palette, Globe, Server, ShieldCheck, Check, Moon, Sun, Monitor, Laptop } from 'lucide-react';

export const SettingsPage = () => {
    const { theme, setTheme, language, setLanguage, serverUrl, setServerUrl, t } = useConfig();
    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'network' | 'admin'>('general');

    const themes = [
        { id: 'dark', name: t('themeDark'), icon: Moon, colors: 'bg-slate-900 text-white' },
        { id: 'light', name: t('themeLight'), icon: Sun, colors: 'bg-slate-100 text-slate-900 border border-slate-200' },
        { id: 'system', name: t('themeSystem'), icon: Monitor, colors: 'bg-gradient-to-br from-slate-100 to-slate-900 text-slate-500' },
        { id: 'blue', name: t('themeBlue'), icon: Laptop, colors: 'bg-blue-600 text-white' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t('systemSettings')}</h1>
                    <p className="text-muted-foreground">{t('settingsDesc')}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'general' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">{t('general')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <Palette className="w-4 h-4" />
                        <span className="font-medium">{t('appearance')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'network' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <Server className="w-4 h-4" />
                        <span className="font-medium">{t('network')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">{t('admin')}</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-card rounded-3xl border border-border p-8 min-h-[400px] shadow-sm">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">{t('displayLanguage')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CONFIG.LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as any)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang.code ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs shadow-inner">
                                                {lang.code.toUpperCase()}
                                            </div>
                                            <span className="font-semibold">{lang.name}</span>
                                        </div>
                                        {language === lang.code && (
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="w-4 h-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">{t('displayMode')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {themes.map((t_item) => {
                                    const Icon = t_item.icon;
                                    return (
                                        <button
                                            key={t_item.id}
                                            onClick={() => setTheme(t_item.id as any)}
                                            className={`group flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all ${theme === t_item.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-md ${t_item.colors}`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <span className="font-semibold text-sm">{t_item.name}</span>
                                            {theme === t_item.id && (
                                                <div className="p-1 bg-primary rounded-full ring-4 ring-primary/10">
                                                    <Check className="w-3 h-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-8 space-y-4">
                                <h3 className="text-xl font-bold">{t('wallpaper')}</h3>
                                <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border italic text-muted-foreground text-sm flex items-center justify-center">
                                    {t('wallpaperDesc')}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">{t('connectionConfig')}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">{t('apiUrl')}</label>
                                    <input
                                        type="text"
                                        value={serverUrl}
                                        onChange={(e) => setServerUrl(e.target.value)}
                                        className="w-full bg-background border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                                        placeholder="http://localhost:8000"
                                    />
                                </div>
                                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs leading-relaxed flex gap-3">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">!</div>
                                    <p>{t('networkWarning')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold mb-4">{t('adminAccount')}</h3>
                            <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-muted-foreground text-sm">{t('administrator')}:</span>
                                    <span className="font-mono text-sm font-bold">{CONFIG.ADMIN.ID}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-muted-foreground text-sm">{t('password')}:</span>
                                    <span className="font-mono text-sm">********</span>
                                </div>
                                <button className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20">
                                    {t('changePassword')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};