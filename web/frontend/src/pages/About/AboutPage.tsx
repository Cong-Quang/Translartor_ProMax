import { useState } from 'react';
import { ManufacturerInfo } from './ManufacturerInfo';
import { TermsOfService } from './TermsOfService';
import { Info, ShieldCheck } from 'lucide-react';

export const AboutPage = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'terms'>('info');

    return (
        <div className="container mx-auto max-w-6xl pb-10">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                        Giới Thiệu
                    </h1>
                    <p className="text-muted-foreground mt-2">Tìm hiểu thêm về đội ngũ phát triển và các quy định sử dụng.</p>
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex p-1.5 bg-secondary/30 rounded-2xl border border-white/5 backdrop-blur-sm self-stretch md:self-auto">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${activeTab === 'info'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-white/5'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Info className="w-4 h-4" />
                        <span>Nhà sản xuất</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${activeTab === 'terms'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-white/5'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Điều khoản</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[60vh] rounded-3xl">
                {activeTab === 'info' ? (
                    <ManufacturerInfo />
                ) : (
                    <TermsOfService />
                )}
            </div>

            {/* Footer decoration */}
            <div className="mt-20 flex justify-center opacity-20 pointer-events-none">
                <div className="text-6xl font-black tracking-tighter select-none">TRANSLARTOR PROMAX</div>
            </div>
        </div>
    );
};
