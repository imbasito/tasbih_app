import { useState, useEffect, useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const hapticsAvailable = Capacitor.isNativePlatform();

export function useTasbih(dhikrId, initialCount = 0, targetCount = 33, onComplete, recordCount) {
    const storageKey = `tasbih_count_${dhikrId}`;

    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved, 10) : initialCount;
    });

    const completedRef = useRef(false);

    useEffect(() => {
        setCount(() => {
            const saved = localStorage.getItem(storageKey);
            return saved ? parseInt(saved, 10) : initialCount;
        });
        completedRef.current = false;
    }, [dhikrId]);

    useEffect(() => {
        localStorage.setItem(storageKey, String(count));

        if (count >= targetCount && !completedRef.current) {
            completedRef.current = true;
            setTimeout(() => {
                onComplete && onComplete();
            }, 200);
        }
    }, [count, targetCount, storageKey]);

    const increment = useCallback(() => {
        if (completedRef.current) return;

        setCount(prev => {
            const next = prev + 1;
            // Haptic feedback
            if (hapticsAvailable) {
                Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
            }
            // Record for stats
            recordCount && recordCount(1);
            return next;
        });
    }, [recordCount]);

    const reset = useCallback(() => {
        completedRef.current = false;
        setCount(0);
        localStorage.setItem(storageKey, '0');
    }, [storageKey]);

    const progress = Math.min(count / targetCount, 1);

    return { count, increment, reset, progress, isComplete: count >= targetCount };
}
