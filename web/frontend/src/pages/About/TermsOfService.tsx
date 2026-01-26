import { ScrollText, ShieldCheck, Scale, EyeOff, AlertCircle } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const TermsOfService = () => {
    const { t } = useConfig();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 font-display uppercase tracking-tight">{t('termsOfService')}</h2>
                    <p className="text-muted-foreground italic text-sm">{t('lastUpdated')}</p>
                </div>
                <div className="hidden sm:block p-4 bg-primary/10 rounded-2xl">
                    <ScrollText className="w-10 h-10 text-primary" />
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">{t('term1')}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-9 text-sm">
                    {t('term1Desc')}
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">{t('term2')}</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>{t('term2Desc1')}</p>
                    <p>{t('term2Desc2')}</p>
                </div>
            </section>

            <section className="space-y-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-3">
                    <EyeOff className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold text-white">{t('term3')}</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>{t('term3Intro')}</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>{t('term3Desc1')}</li>
                        <li>{t('term3Desc2')}</li>
                        <li>{t('term3Desc3')}</li>
                    </ul>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">{t('term4')}</h3>
                </div>
                <div className="pl-9 space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>{t('term4Desc1')}</p>
                    <p>{t('term4Desc2')}</p>
                </div>
            </section>

            <div className="pt-8 text-center border-t border-white/5">
                <p className="text-sm text-muted-foreground">
                    {t('footerContact')} <span className="text-primary hover:underline cursor-pointer">xomnhala.contact@gmail.com</span>
                </p>
            </div>
        </div>
    );
};
