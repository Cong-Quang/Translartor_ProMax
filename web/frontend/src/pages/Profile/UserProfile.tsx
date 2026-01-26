import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Camera, Edit3, Shield, Award, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { supabase } from '../../supabase';

export const UserProfile = () => {
    const { user } = useAuth();
    const { t } = useConfig();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Local state for form data
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        website: '',
        avatar_url: '',
    });

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('username, full_name, website, avatar_url')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setFormData({
                    full_name: data.full_name || user?.user_metadata?.full_name || '',
                    username: data.username || user?.user_metadata?.username || '',
                    website: data.website || '',
                    avatar_url: data.avatar_url || user?.user_metadata?.avatar_url || '',
                });
            }
        } catch (error) {
            console.error('Error loading user data!', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);

            const updates = {
                id: user?.id,
                email: user?.email, // Fix: Required for upsert if row doesn't exist
                username: formData.username,
                full_name: formData.full_name,
                website: formData.website,
                avatar_url: formData.avatar_url,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }
            setIsEditing(false);
            alert(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating the data! Check console for details.');
        } finally {
            setLoading(false);
        }
    };

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
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            {/* Form Fields or Display */}
                            <div className="space-y-4">
                                {isEditing ? (
                                    <div className="grid gap-4 max-w-sm">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">{t('fullName')}</label>
                                            <input
                                                type="text"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">{t('username')}</label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                                            <h1 className="text-3xl font-extrabold tracking-tight">{formData.full_name || 'User'}</h1>
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                                                {t('role')}: User
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</div>
                                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Vietnam</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold flex items-center gap-2">
                                        <X className="w-4 h-4" /> {t('cancel')}
                                    </button>
                                    <button onClick={updateProfile} disabled={loading} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-white/5 transition-all text-sm font-bold flex items-center gap-2">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('save')}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" /> {t('editProfile')}
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
                                        <span className="text-sm font-medium">Bảo mật</span>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-bold">Standard</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-amber-400" />
                                        <span className="text-sm font-medium">Thành viên từ</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-bold">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Static Bio for now as it's not in schema yet, or map to website field? Let's just keep static or hide */}
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t('bio')}</h3>
                            <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                "{t('developing')}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
