
import { Video, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, desc, to, color }: any) => (
    <Link
        to={to}
        className="group relative p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-none block overflow-hidden hover:border-primary/50"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white" style={{ color: '#ffffff' }}>{title}</h3>
            <p className="text-sm leading-relaxed text-gray-200" style={{ color: '#e5e7eb' }}>{desc}</p>
        </div>
        <div className="absolute bottom-6 right-6">
            <ArrowRight className="w-5 h-5 text-primary" />
        </div>
    </Link>
);

export const HomePage = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                    Kết nối không giới hạn
                </h1>
                <p className="text-xl text-gray-200 max-w-2xl mx-auto font-medium">
                    Nền tảng họp trực tuyến bảo mật, chất lượng cao với khả năng dịch thuật thời gian thực.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    to="/meeting-new"
                    icon={Video}
                    title="Cuộc họp mới"
                    desc="Tạo phòng họp ngay lập tức và mời mọi người tham gia."
                    color="from-blue-500 to-cyan-500"
                />
                <FeatureCard
                    to="/join"
                    icon={Users}
                    title="Tham gia"
                    desc="Nhập mã phòng hoặc liên kết để tham gia cuộc họp đang diễn ra."
                    color="from-emerald-500 to-teal-500"
                />
                <FeatureCard
                    to="/schedule"
                    icon={Calendar}
                    title="Lên lịch"
                    desc="Lên kế hoạch cho các cuộc họp trong tương lai."
                    color="from-purple-500 to-pink-500"
                />
            </div>

            {/* Recent History or Stats could go here */}
        </div>
    );
};


