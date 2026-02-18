import { useState, useEffect, useCallback, useMemo } from 'react';
import { MILESTONES } from '../data/milestones';
import { KEYS } from '../constants/keys';

const getTodayKey = () => new Date().toISOString().split('T')[0];


export function useStats() {
    const [lifetimeCount, setLifetimeCount] = useState(() => {
        return parseInt(localStorage.getItem(KEYS.LIFETIME_COUNT) || '0', 10);
    });

    const [milestonesReached, setMilestonesReached] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEYS.MILESTONES) || '[]'); }
        catch { return []; }
    });

    const [dailyStats, setDailyStats] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEYS.DAILY_STATS) || '{}'); }
        catch { return {}; }
    });

    const [streak, setStreak] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEYS.STREAK) || '{"current":0,"best":0,"lastDate":""}'); }
        catch { return { current: 0, best: 0, lastDate: '' }; }
    });

    const [milestoneToast, setMilestoneToast] = useState(null);

    // Persist
    useEffect(() => { localStorage.setItem(KEYS.LIFETIME_COUNT, String(lifetimeCount)); }, [lifetimeCount]);
    useEffect(() => { localStorage.setItem(KEYS.MILESTONES, JSON.stringify(milestonesReached)); }, [milestonesReached]);
    useEffect(() => { localStorage.setItem(KEYS.DAILY_STATS, JSON.stringify(dailyStats)); }, [dailyStats]);
    useEffect(() => { localStorage.setItem(KEYS.STREAK, JSON.stringify(streak)); }, [streak]);

    const recordCount = useCallback((amount = 1) => {
        const today = getTodayKey();

        // Update lifetime
        setLifetimeCount(prev => {
            const newTotal = prev + amount;

            // Check milestones
            const nextMilestone = MILESTONES.find(
                m => m.threshold <= newTotal && !milestonesReached.includes(m.threshold)
            );
            if (nextMilestone) {
                setMilestonesReached(r => [...r, nextMilestone.threshold]);
                setMilestoneToast(nextMilestone);
                setTimeout(() => setMilestoneToast(null), 5000);
            }

            return newTotal;
        });

        // Update daily stats
        setDailyStats(prev => ({
            ...prev,
            [today]: (prev[today] || 0) + amount,
        }));

        // Update streak
        setStreak(prev => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];

            let newCurrent = prev.current;
            if (prev.lastDate === today) {
                // Already counted today, no streak change
                newCurrent = prev.current;
            } else if (prev.lastDate === yesterdayKey) {
                newCurrent = prev.current + 1;
            } else if (prev.lastDate !== today) {
                newCurrent = 1;
            }

            return {
                current: newCurrent,
                best: Math.max(prev.best, newCurrent),
                lastDate: today,
            };
        });
    }, [milestonesReached]);

    const todayCount = dailyStats[getTodayKey()] || 0;

    // Category breakdown — memoized, recomputed only when adhkarData changes
    const categoryBreakdown = useMemo(() => {
        try {
            const adhkarData = JSON.parse(localStorage.getItem(KEYS.ADHKAR_DATA) || '{}');
            const breakdown = {};
            Object.keys(adhkarData).forEach(cat => {
                const items = adhkarData[cat] || [];
                const total = items.reduce((sum, item) => {
                    return sum + parseInt(localStorage.getItem(`${KEYS.COUNT_PREFIX}${item.id}`) || '0', 10);
                }, 0);
                if (total > 0) breakdown[cat] = total;
            });
            return breakdown;
        } catch { return {}; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lifetimeCount]); // recompute when lifetime count changes (i.e. after each tap)

    return {
        lifetimeCount,
        todayCount,
        streak,
        milestoneToast,
        milestonesReached,
        recordCount,
        categoryBreakdown,
        dailyStats,
        dismissMilestoneToast: () => setMilestoneToast(null),
    };
}
