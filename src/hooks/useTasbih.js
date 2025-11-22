import { useState, useEffect } from 'react';

// The hook now accepts a unique ID for each dhikr to store counts separately.
export const useTasbih = (dhikrId, initialCount = 0, targetCount = null) => {
    const STORAGE_KEY = `tasbih_count_${dhikrId}`; // Dynamic key based on Dhikr ID

    const [count, setCount] = useState(() => {
        // If no specific dhikrId is provided, don't use storage.
        if (!dhikrId) return initialCount;
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved !== null ? parseInt(saved, 10) : initialCount;
    });

    useEffect(() => {
        // Only save to localStorage if there is a dhikrId.
        if (dhikrId) {
            localStorage.setItem(STORAGE_KEY, count.toString());
        }
    }, [count, dhikrId, STORAGE_KEY]);

    const triggerHaptic = (isTargetReached) => {
        if (navigator.vibrate) {
            try {
               if (isTargetReached) {
                   // Long vibration for target reached
                   navigator.vibrate([100, 50, 100, 50, 200]); 
               } else {
                   // Standard short tick
                   navigator.vibrate(40); 
               }
            } catch(e) {
                console.error("Vibration failed", e);
            }
        }
    };

    const increment = () => {
        setCount(prev => {
            const newCount = prev + 1;
            // Check if we hit the target exactly
            const isTargetReached = targetCount && newCount === targetCount;
            triggerHaptic(isTargetReached);
            return newCount;
        });
    };

    const reset = () => {
        setCount(0);
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]); // Distinct pattern for reset
        }
    };

    return { count, increment, reset };
};
