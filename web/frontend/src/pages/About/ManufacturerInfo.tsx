import { Users, Mail, Phone, Fingerprint, Shield } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const ManufacturerInfo = () => {
    const { t } = useConfig();

    const members = [
        { name: "Lê Huỳnh Ngọc", role: t('leader'), id: "2380601465", phone: "0365936037", email: "quoclam2278@gmail.com" },
        { name: "Nguyễn Công Quang", role: t('member'), id: "2380601806", phone: "0796659071", email: "nguyencongquang02082003@gmail.com" },
        { name: "Nguyễn Trường Phát", role: t('member'), id: "2380681640", phone: "0971840346", email: "tinal27725@gmail.com" },
        { name: "Nguyễn Thanh Bảo Ngân", role: t('member'), id: "2380601424", phone: "0329336782", email: "baongan05289@gmail.com" },
        { name: "Nguyễn Phương Nam", role: t('member'), id: "2380613311", phone: "0798116277", email: "nguyenphuongnam16112005@gmail.com" },
        { name: "Ngô Nguyễn Thu Hương", role: t('member'), id: "2380600942", phone: "0937889356", email: "ngo24616@gmail.com" },
        { name: "Trương Thị Yến Nhi", role: t('member'), id: "2380601581", phone: "0386431044", email: "yennhitruong704@gmail.com" },
        { name: "Ngô Cẩm Nhung", role: t('member'), id: "2380601588", phone: "0865405507", email: "ngon49849@gmail.com" }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Team Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-8 py-10 bg-card rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/20">
                        XL
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">{t('teamName')}</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            {t('teamDesc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-secondary/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold">{t('aboutProject')}</h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1.5">•</span>
                            <span>{t('projectDesc1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1.5">•</span>
                            <span>{t('projectDesc2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1.5">•</span>
                            <span>{t('projectDesc3')}</span>
                        </li>
                    </ul>
                </div>
                <div className="p-6 bg-secondary/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold">{t('teamSize')}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('teamSizeDesc')}
                    </p>
                    <div className="mt-4 flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white uppercase tracking-wider tabular-nums">08</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('members')}</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white uppercase tracking-wider tabular-nums">03</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('aiFields')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="text-2xl font-bold tracking-tight">{t('memberDetail')}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {members.map((member, idx) => (
                        <div key={idx} className="group p-5 bg-card hover:bg-secondary/30 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{member.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{member.role}</p>
                                </div>
                                <Fingerprint className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 opacity-20 group-hover:opacity-100 transition-all" />
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-white/5"><Phone className="w-3 h-3" /></div>
                                    <span>{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-white/5"><Mail className="w-3 h-3" /></div>
                                    <span className="truncate">{member.email}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/5 text-[10px] font-mono opacity-50">
                                    ID: {member.id}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
