import { ScrollText, ShieldCheck, Scale, EyeOff, AlertCircle } from 'lucide-react';

export const TermsOfService = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 font-display">Điều Khoản Dịch Vụ</h2>
                    <p className="text-muted-foreground italic">Cập nhật lần cuối: 25 tháng 01, 2026</p>
                </div>
                <div className="hidden sm:block p-4 bg-primary/10 rounded-2xl">
                    <ScrollText className="w-10 h-10 text-primary" />
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">1. Chấp Thuận Điều Khoản</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-9">
                    Bằng cách truy cập và sử dụng ứng dụng Translartor_ProMax, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">2. Quyền Sở Hữu Trí Tuệ</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed">
                    <p>
                        Toàn bộ nội dung, mã nguồn, thuật toán AI và thiết kế giao diện của ứng dụng thuộc sở hữu độc quyền của <strong>Nhóm Xóm Nhà Lá</strong>.
                    </p>
                    <p>
                        Người dùng được cấp quyền sử dụng ứng dụng cho mục đích cá nhân hoặc công việc chuyên môn theo quy chế của hệ thống, không bao gồm hành vi sao chép, dịch ngược hoặc phân phối trái phép.
                    </p>
                </div>
            </section>

            <section className="space-y-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-3">
                    <EyeOff className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold text-white">3. Chính Sách Bảo Mật & Dữ Liệu</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed">
                    <p>
                        Chúng tôi tôn trọng quyền riêng tư của người dùng:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Dữ liệu âm thanh được xử lý trực tiếp tại máy chủ cục bộ (Local Server) và không bị lưu giữ vĩnh viễn sau khi phiên dịch kết thúc.</li>
                        <li>Chúng tôi không chia sẻ bản dịch hoặc thông tin cá nhân của bạn với bất kỳ bên thứ ba nào.</li>
                        <li>Người dùng chịu trách nhiệm về nội dung hội thoại được truyền tải qua hệ thống.</li>
                    </ul>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">4. Giới Hạn Trách Nhiệm</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed">
                    <p>
                        Dịch thuật AI là một quá trình phức tạp và có thể không đảm bảo độ chính xác 100%. <strong>Xóm Nhà Lá</strong> không chịu trách nhiệm cho bất kỳ tổn thất trực tiếp hoặc gián tiếp nào phát sinh từ việc sai sót trong nội dung dịch thuật.
                    </p>
                    <p>
                        Hệ thống yêu cầu cấu hình phần cứng tối thiểu để hoạt động ổn định. Hiệu năng thực tế có thể thay đổi tùy thuộc vào môi trường truyền tải và thiết bị của người dùng.
                    </p>
                </div>
            </section>

            <div className="pt-8 text-center border-t border-white/5">
                <p className="text-sm text-muted-foreground">
                    Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi. <br />
                    Mọi thắc mắc vui lòng liên hệ: <span className="text-primary hover:underline cursor-pointer">xomnhala.contact@gmail.com</span>
                </p>
            </div>
        </div>
    );
};
