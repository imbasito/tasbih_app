import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { KEYS } from '../constants/keys';
import { INITIAL_ADHKAR_DATA } from '../data/adhkar';

const AdhkarContext = createContext(null);

export function AdhkarProvider({ children }) {
    const [adhkarData, setAdhkarData] = useLocalStorage(KEYS.ADHKAR_DATA, INITIAL_ADHKAR_DATA);
    const [activeDhikr, setActiveDhikr] = useLocalStorage(KEYS.ACTIVE_DHIKR, null);
    const [showAameen, setShowAameen] = useState(false);

    // Initialize active dhikr if null
    useEffect(() => {
        if (!activeDhikr) {
            const firstCat = Object.keys(adhkarData)[0];
            if (firstCat && adhkarData[firstCat]?.length > 0) {
                setActiveDhikr({ ...adhkarData[firstCat][0], category: firstCat });
            }
        }
    }, []);

    const selectDhikr = useCallback((dhikr) => {
        setActiveDhikr(dhikr);
        setShowAameen(false);
    }, []);

    const selectCategory = useCallback((cat) => {
        const items = adhkarData[cat];
        if (items?.length > 0) {
            setActiveDhikr({ ...items[0], category: cat });
            setShowAameen(false);
        }
    }, [adhkarData]);

    const handleDhikrComplete = useCallback(() => {
        if (!activeDhikr) return;
        const cat = activeDhikr.category;
        const items = adhkarData[cat] || [];
        const idx = items.findIndex(d => d.id === activeDhikr.id);
        if (idx >= 0 && idx < items.length - 1) {
            setActiveDhikr({ ...items[idx + 1], category: cat });
        } else {
            setShowAameen(true);
        }
    }, [activeDhikr, adhkarData]);

    const handleResetCategory = useCallback(() => {
        if (!activeDhikr) return;
        const cat = activeDhikr.category;
        const items = adhkarData[cat] || [];
        if (items.length > 0) {
            items.forEach(d => localStorage.removeItem(`${KEYS.COUNT_PREFIX}${d.id}`));
            setActiveDhikr({ ...items[0], category: cat });
            setShowAameen(false);
        }
    }, [activeDhikr, adhkarData]);

    const handleNextDhikr = useCallback(() => {
        if (!activeDhikr) return;
        const cats = Object.keys(adhkarData);
        const catIdx = cats.indexOf(activeDhikr.category);
        const nextCat = cats[(catIdx + 1) % cats.length];
        const items = adhkarData[nextCat] || [];
        if (items.length > 0) setActiveDhikr({ ...items[0], category: nextCat });
        setShowAameen(false);
    }, [activeDhikr, adhkarData]);

    const safeActiveDhikr = activeDhikr || Object.values(adhkarData)[0]?.[0] || null;

    return (
        <AdhkarContext.Provider value={{
            adhkarData, setAdhkarData,
            activeDhikr: safeActiveDhikr, setActiveDhikr,
            showAameen, setShowAameen,
            selectDhikr, selectCategory,
            handleDhikrComplete, handleResetCategory, handleNextDhikr,
        }}>
            {children}
        </AdhkarContext.Provider>
    );
}

export function useAdhkar() {
    const ctx = useContext(AdhkarContext);
    if (!ctx) throw new Error('useAdhkar must be used inside AdhkarProvider');
    return ctx;
}
