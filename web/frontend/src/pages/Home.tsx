import { Video, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const FeatureCard = ({ icon: Icon, title, desc, to, color }: any) => (
    <Link
        to={to}
        className="group relative p-8 rounded-3xl border border-border bg-card hover:bg-card/80 transition-all block overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
        <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>
        <div className="absolute bottom-8 right-8 transition-transform group-hover:translate-x-1">
            <ArrowRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100" />
        </div>
    </Link>
);

export const HomePage = () => {
    const { t } = useConfig();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-16">
                <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-bounce">
                    Next Generation Meeting
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                    {t('heroTitle')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                    {t('heroDesc')}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                    to="/meeting-new"
                    icon={Video}
                    title={t('newMeeting')}
                    desc={t('newMeetingDesc')}
                    color="from-blue-500 to-cyan-500"
                />
                <FeatureCard
                    to="/join"
                    icon={Users}
                    title={t('join')}
                    desc={t('joinDesc')}
                    color="from-emerald-500 to-teal-500"
                />
                <FeatureCard
                    to="/schedule"
                    icon={Calendar}
                    title={t('schedule')}
                    desc={t('scheduleDesc')}
                    color="from-purple-500 to-pink-500"
                />
            </div>

            {/* Decoration or Stats */}
            <div className="pt-8 border-t border-border flex flex-wrap justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded bg-foreground/10 flex items-center justify-center">✦</div> AI TRANSLATE
                </div>
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded bg-foreground/10 flex items-center justify-center">◈</div> SECURE P2P
                </div>
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded bg-foreground/10 flex items-center justify-center">▣</div> ULTRA HD
                </div>
            </div>
        </div>
    );
};