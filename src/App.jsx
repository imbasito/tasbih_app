import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BottomNav from './components/BottomNav';
import TasbihCounter from './components/TasbihCounter';
import AdhkarList from './components/AdhkarList';
import PrayerTimesView from './components/PrayerTimesView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import DuaOfTheDay from './components/DuaOfTheDay';
import MilestoneToast from './components/MilestoneToast';
import QiblaCompass from './components/QiblaCompass';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AdhkarProvider, useAdhkar } from './context/AdhkarContext';
import { useStats } from './hooks/useStats';
import { KEYS } from './constants/keys';

// ─── Inner app (has access to contexts) ──────────────────────────────────────
const AppInner = () => {
    const { isDark } = useSettings();
    const { activeDhikr, showAameen } = useAdhkar();
    const { lifetimeCount, todayCount, streak, milestoneToast, milestonesReached, recordCount, categoryBreakdown, dailyStats, dismissMilestoneToast } = useStats();

    const [currentView, setCurrentView] = useState('counter');
    const [focusLocked, setFocusLocked] = useState(false);
    const [showQibla, setShowQibla] = useState(false);
    const [showDua, setShowDua] = useState(false);

    const todayKey = new Date().toDateString();

    useEffect(() => {
        const duaLastShown = localStorage.getItem(KEYS.DUA_LAST_SHOWN);
        const duaEnabled = (() => {
            try {
                const s = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
                return s.duaOnLaunch !== false;
            } catch { return true; }
        })();
        if (duaEnabled && duaLastShown !== todayKey) {
            const t = setTimeout(() => setShowDua(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const handleDismissDua = () => {
        setShowDua(false);
        localStorage.setItem(KEYS.DUA_LAST_SHOWN, todayKey);
    };

    return (
        <Layout isDark={isDark}>
            <MilestoneToast milestone={milestoneToast} onDismiss={dismissMilestoneToast} />
            {showDua && <DuaOfTheDay onDismiss={handleDismissDua} />}
            {showQibla && <QiblaCompass onBack={() => setShowQibla(false)} />}

            {currentView === 'counter' && activeDhikr && (
                <TasbihCounter
                    recordCount={recordCount}
                    focusLocked={focusLocked}
                    onToggleFocusLock={() => setFocusLocked(f => !f)}
                    showAameen={showAameen}
                />
            )}

            {currentView === 'adhkar' && <AdhkarList />}

            {currentView === 'prayer' && <PrayerTimesView />}

            {currentView === 'stats' && (
                <StatsView
                    lifetimeCount={lifetimeCount}
                    todayCount={todayCount}
                    streak={streak}
                    milestonesReached={milestonesReached}
                    categoryBreakdown={categoryBreakdown}
                    dailyStats={dailyStats}
                />
            )}

            {currentView === 'settings' && (
                <SettingsView onOpenQibla={() => setShowQibla(true)} />
            )}

            {!focusLocked && (
                <BottomNav currentView={currentView} onViewChange={setCurrentView} />
            )}
        </Layout>
    );
};

// ─── Root with providers ──────────────────────────────────────────────────────
const App = () => (
    <SettingsProvider>
        <AdhkarProvider>
            <AppInner />
        </AdhkarProvider>
    </SettingsProvider>
);

export default App;
