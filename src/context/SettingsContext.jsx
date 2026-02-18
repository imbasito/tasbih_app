import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { KEYS } from '../constants/keys';

const DEFAULT_SETTINGS = {
    haptic: true,
    breathingMode: false,
    duaOnLaunch: true,
    duaNotification: false,
    ramadanMode: false,
    notifications: {
        fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
    },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [isDark, setIsDark] = useLocalStorage(KEYS.THEME_DARK, false);
    const [settings, setSettings] = useLocalStorage(KEYS.SETTINGS, DEFAULT_SETTINGS);

    const updateSetting = (key, value) =>
        setSettings(prev => ({ ...prev, [key]: value }));

    const toggleTheme = (theme) => setIsDark(theme === 'dark');

    return (
        <SettingsContext.Provider value={{ settings, setSettings, updateSetting, isDark, toggleTheme }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
}
