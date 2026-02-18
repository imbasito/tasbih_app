import { useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const PRAYER_NOTIFICATIONS = {
    fajr: { id: 1, title: '🌅 Fajr Mubarak!', body: 'Start your day with Morning Adhkar. A blessed beginning awaits. 📿', category: 'morning' },
    dhuhr: { id: 2, title: '☀️ Dhuhr Time', body: 'Take a moment for After-Prayer Adhkar. Strengthen your connection. 📿', category: 'after-prayer' },
    asr: { id: 3, title: '🌤️ Asr Prayer', body: 'The best of deeds are those done consistently. Evening Adhkar time. 📿', category: 'evening' },
    maghrib: { id: 4, title: '🌅 Maghrib Mubarak!', body: 'As the sun sets, recite Evening Adhkar for protection and peace. 📿', category: 'evening' },
    isha: { id: 5, title: '🌙 Isha Time', body: 'End your day with dhikr. Remember Allah before you sleep. 📿', category: 'after-prayer' },
};

export function useNotifications(prayerTimes, settings) {
    const scheduleNotifications = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;
        if (!prayerTimes || !settings) return;

        try {
            const perm = await LocalNotifications.requestPermissions();
            if (perm.display !== 'granted') return;

            // Cancel existing prayer notifications
            await LocalNotifications.cancel({
                notifications: Object.values(PRAYER_NOTIFICATIONS).map(n => ({ id: n.id }))
            });

            const toSchedule = [];
            const now = new Date();

            Object.entries(PRAYER_NOTIFICATIONS).forEach(([prayer, notif]) => {
                // Check if this prayer's notification is enabled in settings
                const enabled = settings.notifications?.[prayer] !== false; // default true
                if (!enabled) return;

                const prayerTime = prayerTimes[prayer];
                if (!prayerTime) return;

                // Schedule for today + 5 min after prayer
                const scheduleTime = new Date(prayerTime);
                scheduleTime.setMinutes(scheduleTime.getMinutes() + 5);

                // If already passed today, skip (will be rescheduled tomorrow)
                if (scheduleTime <= now) return;

                toSchedule.push({
                    id: notif.id,
                    title: notif.title,
                    body: notif.body,
                    schedule: { at: scheduleTime },
                    extra: { category: notif.category },
                    smallIcon: 'ic_notification',
                    iconColor: '#2D6A4F',
                });
            });

            if (toSchedule.length > 0) {
                await LocalNotifications.schedule({ notifications: toSchedule });
            }
        } catch (e) {
            console.warn('Notification scheduling error:', e);
        }
    }, [prayerTimes, settings]);

    useEffect(() => {
        scheduleNotifications();
    }, [scheduleNotifications]);

    return { scheduleNotifications };
}
