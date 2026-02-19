import { useState, useEffect, useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const hapticsAvailable = Capacitor.isNativePlatform();

export function useTasbih(dhikrId, initialCount = 0, targetCount = 33, onComplete, recordCount) {
    const storageKey = `tasbih_count_${dhikrId}`;

    // Initialize directly from localStorage — no animation from 0 to stored value
    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved, 10) : initialCount;
    });

    const completedRef = useRef(false);

    // When dhikr changes, load saved count instantly (no transition animation)
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        const restored = saved ? parseInt(saved, 10) : initialCount;
        setCount(restored);
        // If already complete, mark it so we don't re-fire completion
        completedRef.current = restored >= targetCount;
    }, [dhikrId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist and check completion whenever count changes
    useEffect(() => {
        localStorage.setItem(storageKey, String(count));

        if (count >= targetCount && !completedRef.current) {
            completedRef.current = true;
            setTimeout(() => {
                onComplete && onComplete();
            }, 200);
        }
    }, [count, targetCount, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const increment = useCallback(() => {
        if (completedRef.current) return;

        setCount(prev => {
            const next = prev + 1;
            if (hapticsAvailable) {
                Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
            }
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
