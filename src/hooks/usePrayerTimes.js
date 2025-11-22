import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export const usePrayerTimes = () => {
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Try to load last known location
        const savedLocation = localStorage.getItem('lastKnownLocation');
        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation));
            } catch (e) {
                console.error('Failed to parse saved location', e);
            }
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        // Relaxed options to prevent timeouts indoors
        const options = {
            enableHighAccuracy: false, // Changed to false for faster/more reliable lock indoors
            timeout: 10000,            // Increased timeout to 10s
            maximumAge: 60000          // Accept cached location up to 1 minute old
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setLocation(newLocation);
                localStorage.setItem('lastKnownLocation', JSON.stringify(newLocation));
                setError(null); 
            },
            (err) => {
                // If high accuracy failed or timeout, try again with low accuracy (if we were using high)
                // But here we default to low accuracy for stability.
                
                if (!savedLocation) {
                    let errorMessage = 'Unable to retrieve your location.';
                    if (err.code === 1) errorMessage = 'Location permission denied. Please enable it in settings.';
                    if (err.code === 2) errorMessage = 'Location unavailable.';
                    if (err.code === 3) errorMessage = 'Location request timed out.';
                    setError(errorMessage);
                }
                console.error(err);
            },
            options
        );
    }, []);

    useEffect(() => {
        if (location) {
            try {
                const date = new Date();
                const coordinates = new Coordinates(location.latitude, location.longitude);
                // Muslim World League is a reputable source
                const params = CalculationMethod.MuslimWorldLeague();
                const times = new PrayerTimes(coordinates, date, params);

                setPrayerTimes(times);

                const next = times.nextPrayer();
                const current = times.currentPrayer();

                setNextPrayer({
                    current: current,
                    next: next,
                    nextTime: times.timeForPrayer(next)
                });
            } catch (e) {
                console.error("Error calculating prayer times:", e);
                setError("Error calculating times for this location.");
            }
        }
    }, [location]);

    return { prayerTimes, nextPrayer, location, error };
};
