
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONFIG } from '../config';
import { translations } from '../i18n';
import type { Language, TranslationKeys } from '../i18n';

export type ThemeMode = 'light' | 'dark' | 'system' | 'blue';

interface ConfigContextType {
    theme: ThemeMode;
    language: Language;
    serverUrl: string;
    CONFIG: typeof CONFIG;
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (lang: Language) => void;
    setServerUrl: (url: string) => void;
    t: (key: TranslationKeys) => string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    // Safely initialize state from localStorage
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('app-theme');
        if (saved && ['light', 'dark', 'system', 'blue'].includes(saved)) {
            return saved as ThemeMode;
        }
        return 'dark';
    });

    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('app-lang');
        if (saved && (saved === 'vi' || saved === 'en')) {
            return saved as Language;
        }
        return 'vi';
    });

    const [serverUrl, setServerUrl] = useState(CONFIG.SERVER.BASE_URL);

    // Robust translation function
    const t = (key: TranslationKeys): string => {
        try {
            const langData = translations[language] || translations['vi'];
            return langData[key as keyof typeof langData] || translations['en']?.[key as keyof typeof translations['en']] || key;
        } catch (e) {
            return key;
        }
    };

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('app-lang', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('app-server-url', serverUrl);
    }, [serverUrl]);

    // Handle system theme changes
    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');

            applyTheme('system');

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const applyTheme = (mode: ThemeMode) => {
        try {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark', 'blue');

            let effectiveTheme = mode;
            if (mode === 'system') {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            root.classList.add(effectiveTheme);
        } catch (e) {
            console.error("Failed to apply theme:", e);
        }
    };

    return (
        <ConfigContext.Provider value={{ theme, language, serverUrl, CONFIG, setTheme, setLanguage, setServerUrl, t }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (!context) throw new Error('useConfig must be used within a ConfigProvider');
    return context;
}
