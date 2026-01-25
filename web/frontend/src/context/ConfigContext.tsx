
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONFIG } from '../config';

type ThemeMode = 'light' | 'dark' | 'system' | 'blue';
type Language = 'vi' | 'en';

interface ConfigContextType {
    theme: ThemeMode;
    language: Language;
    serverUrl: string;
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (lang: Language) => void;
    setServerUrl: (url: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('app-theme') as ThemeMode) || 'dark');
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app-lang') as Language) || 'vi');
    const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('app-server-url') || CONFIG.SERVER.BASE_URL);

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

    const applyTheme = (mode: ThemeMode) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        let effectiveTheme = mode;
        if (mode === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        root.classList.add(effectiveTheme);

        // Dynamic CSS variables for advanced themes could go here
        if (mode === 'blue') {
            root.style.setProperty('--background', CONFIG.THEMES.BLUE.colors.background);
            root.style.setProperty('--primary', CONFIG.THEMES.BLUE.colors.primary);
        } else {
            root.style.removeProperty('--background');
            root.style.removeProperty('--primary');
        }
    };

    return (
        <ConfigContext.Provider value={{ theme, language, serverUrl, setTheme, setLanguage, setServerUrl }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error('useConfig must be used within a ConfigProvider');
    return context;
};
