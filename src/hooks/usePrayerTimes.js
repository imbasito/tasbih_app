import { useState, useEffect, useCallback } from 'react';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

const CACHE_KEY = 'tasbih_prayer_times_cache';
const MANUAL_KEY = 'tasbih_prayer_manual_location';

// Default fallback: Karachi
const DEFAULT_LOCATION = { lat: 24.8607, lng: 67.0011, city: 'Karachi (Default)' };

const getCityName = async (lat, lng) => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
    } catch { return null; }
};

export function usePrayerTimes() {
    const [times, setTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isManual, setIsManual] = useState(false);

    const calculateTimes = useCallback(async (lat, lng, cityOverride) => {
        try {
            const coords = new Coordinates(lat, lng);
            // Karachi (University of Islamic Sciences) — most accurate for Pakistan
            const params = CalculationMethod.Karachi();
            params.madhab = Madhab.Hanafi;

            const date = new Date();
            const pt = new PrayerTimes(coords, date, params);

            const timesObj = {
                fajr: pt.fajr,
                dhuhr: pt.dhuhr,
                asr: pt.asr,
                maghrib: pt.maghrib,
                isha: pt.isha,
            };

            setTimes(timesObj);

            // Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                lat, lng,
                date: date.toDateString(),
                times: Object.fromEntries(Object.entries(timesObj).map(([k, v]) => [k, v.toISOString()])),
            }));

            // Get city name (if not overridden)
            const city = cityOverride || await getCityName(lat, lng);
            setLocation({ lat, lng, city });
        } catch (e) {
            setError('Failed to calculate prayer times: ' + e.message);
        }
    }, []);

    // Set a manual location by lat/lng (and optional city name)
    const setManualLocation = useCallback(async (lat, lng, cityName) => {
        setLoading(true);
        setError(null);
        setIsManual(true);
        const city = cityName || await getCityName(lat, lng) || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        localStorage.setItem(MANUAL_KEY, JSON.stringify({ lat, lng, city }));
        await calculateTimes(lat, lng, city);
        setLoading(false);
    }, [calculateTimes]);

    // Clear manual location and go back to GPS
    const clearManualLocation = useCallback(() => {
        localStorage.removeItem(MANUAL_KEY);
        setIsManual(false);
        refresh();
    }, []); // eslint-disable-line

    const refresh = useCallback(() => {
        setLoading(true);
        setError(null);

        // Check for saved manual location first
        try {
            const manual = JSON.parse(localStorage.getItem(MANUAL_KEY) || 'null');
            if (manual) {
                setIsManual(true);
                calculateTimes(manual.lat, manual.lng, manual.city).then(() => setLoading(false));
                return;
            }
        } catch { /* ignore */ }

        // Try GPS
        if (!navigator.geolocation) {
            // No GPS support — use cache or Karachi default
            loadCacheOrDefault();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setIsManual(false);
                await calculateTimes(pos.coords.latitude, pos.coords.longitude);
                setLoading(false);
            },
            () => {
                // GPS denied — try cache, then Karachi default
                loadCacheOrDefault();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [calculateTimes]);

    const loadCacheOrDefault = useCallback(() => {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (cached) {
                const restoredTimes = Object.fromEntries(
                    Object.entries(cached.times).map(([k, v]) => [k, new Date(v)])
                );
                setTimes(restoredTimes);
                setLocation({ lat: cached.lat, lng: cached.lng, city: cached.city || null });
                setError('Using cached times. Enable GPS or set location manually.');
            } else {
                // Karachi default
                calculateTimes(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.city).then(() => {
                    setError('Location unavailable. Showing Karachi times. Set your location manually.');
                });
            }
        } catch {
            calculateTimes(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.city).then(() => {
                setError('Location unavailable. Showing Karachi times.');
            });
        }
        setLoading(false);
    }, [calculateTimes]);

    // Initial load
    useEffect(() => { refresh(); }, []);

    // Update next prayer + countdown every second
    useEffect(() => {
        if (!times) return;
        const update = () => {
            const now = new Date();
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let next = null;
            let minDiff = Infinity;

            prayers.forEach(p => {
                const t = times[p];
                if (t && t > now) {
                    const diff = t - now;
                    if (diff < minDiff) { minDiff = diff; next = p; }
                }
            });

            setNextPrayer(next);
            setCountdown(next ? minDiff : null);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [times]);

    return { times, nextPrayer, countdown, location, loading, error, refresh, isManual, setManualLocation, clearManualLocation };
}
