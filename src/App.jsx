import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TasbihCounter from './components/TasbihCounter';
import AdhkarList from './components/AdhkarList';
import BottomNav from './components/BottomNav';
import PrayerTimesView from './components/PrayerTimesView';

// Adhkar data
const INITIAL_ADHKAR_DATA = {
    morning: [
        { id: 3, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ... (آية الكرسي)", count: 1, translation: "Ayat al-Kursi" },
        { id: 4, text: "سورة الإخلاص", count: 3, translation: "Surah Al-Ikhlas" },
        { id: 41, text: "سورة الفلق", count: 3, translation: "Surah Al-Falaq" },
        { id: 42, text: "سورة الناس", count: 3, translation: "Surah An-Nas" },
        { id: 2, text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ... (سيد الاستغفار)", count: 1, translation: "Sayyidul Istighfar (Master of Forgiveness)" },
        { id: 14, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", count: 3, translation: "Glory is to Allah... by the number of His creation..." },
        { id: 1, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, translation: "Glory is to Allah and praise is to Him" },
        { id: 29, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, translation: "There is no god but Allah alone... (10 times)" },
        { id: 15, text: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ", count: 7, translation: "O Allah, protect me from the Fire (after Fajr prayer)" }
    ],
    evening: [
        { id: 7, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ... (آية الكرسي)", count: 1, translation: "Ayat al-Kursi" },
        { id: 8, text: "سورة الإخلاص", count: 3, translation: "Surah Al-Ikhlas" },
        { id: 81, text: "سورة الفلق", count: 3, translation: "Surah Al-Falaq" },
        { id: 82, text: "سورة الناس", count: 3, translation: "Surah An-Nas" },
        { id: 6, text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ... (سيد الاستغفار)", count: 1, translation: "Sayyidul Istighfar" },
        { id: 24, text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, translation: "I seek refuge in the Perfect Words of Allah..." },
        { id: 5, text: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ", count: 7, translation: "O Allah, protect me from the Fire (after Maghrib prayer)" }
    ],
    "after-prayer": [
        { id: 20, text: "أَسْتَغْفِرُ اللَّهَ", count: 3, translation: "I seek forgiveness from Allah" },
        { id: 31, text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, translation: "O Allah, You are Peace..." },
        { id: 16, text: "سُبْحَانَ اللَّهِ", count: 33, translation: "Glory be to Allah" },
        { id: 17, text: "الْحَمْدُ لِلَّهِ", count: 33, translation: "Praise be to Allah" },
        { id: 18, text: "اللَّهُ أَكْبَرُ", count: 33, translation: "Allah is the Greatest" },
        { id: 19, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ... (تكملة المئة)", count: 1, translation: "There is no god but Allah alone... (to complete 100)" },
        { id: 32, text: "آية الكرسي بعد كل صلاة", count: 1, translation: "Ayat al-Kursi (after every prayer)" },
    ],
    quran: [
        { id: 28, text: "آمَنَ الرَّسُولُ... (آخر آيتين من سورة البقرة)", count: 1, translation: "Last two verses of Surah Al-Baqarah (recite at night)" },
        { id: 33, text: "سورة الملك", count: 1, translation: "Surah Al-Mulk (recite before sleeping)" },
        { id: 34, text: "سورة الكهف", count: 1, translation: "Surah Al-Kahf (recite on Friday)" },
    ],
    general: [
        { id: 9, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", count: 100, translation: "Glory is to Allah and praise is to Him, Glory is to Allah the Great" },
        { id: 10, text: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", count: 100, translation: "I seek forgiveness from Allah..." },
        { id: 11, text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 100, translation: "There is no might nor power except with Allah" },
        { id: 12, text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ", count: 100, translation: "O Allah, send prayers upon Muhammad and the family of Muhammad" },
        { id: 13, text: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", count: 100, translation: "Glory be to Allah, Praise be to Allah, there is no god but Allah, Allah is the Greatest" },
    ]
};

const ADHKAR_STORAGE_KEY = 'tasbih_adhkar_data';
const LAST_Dhikr_KEY = 'tasbih_last_active_dhikr';
const CATEGORY_PROGRESS_KEY = 'tasbih_category_progress';

function App() {
    const [currentView, setCurrentView] = useState('counter');
    const [completionState, setCompletionState] = useState({ showAameen: false });

    const [adhkarData, setAdhkarData] = useState(() => {
        const saved = localStorage.getItem(ADHKAR_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Object.keys(parsed).length > 0) return parsed;
            } catch (e) {
                return INITIAL_ADHKAR_DATA;
            }
        }
        return INITIAL_ADHKAR_DATA;
    });

    const [categoryProgress, setCategoryProgress] = useState(() => {
        const saved = localStorage.getItem(CATEGORY_PROGRESS_KEY);
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem(CATEGORY_PROGRESS_KEY, JSON.stringify(categoryProgress));
    }, [categoryProgress]);

    const [activeDhikr, setActiveDhikr] = useState(() => {
        const saved = localStorage.getItem(LAST_Dhikr_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.id && parsed.text) {
                    if (!parsed.category) parsed.category = 'general';
                    return parsed;
                }
            } catch (e) { }
        }
        return { id: 9, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", count: 100, category: 'general' };
    });

    useEffect(() => {
        localStorage.setItem(ADHKAR_STORAGE_KEY, JSON.stringify(adhkarData));
    }, [adhkarData]);

    useEffect(() => {
        if (activeDhikr) {
            localStorage.setItem(LAST_Dhikr_KEY, JSON.stringify(activeDhikr));
            if (activeDhikr.category) {
                setCategoryProgress(prev => ({
                    ...prev,
                    [activeDhikr.category]: activeDhikr.id
                }));
            }
        }
    }, [activeDhikr]);

    const handleCategorySelect = (category) => {
        setCompletionState({ showAameen: false });
        const lastActiveId = categoryProgress[category];
        const categoryList = adhkarData[category] || [];

        let nextDhikr = categoryList.find(item => item.id === lastActiveId);

        if (!nextDhikr && categoryList.length > 0) {
            nextDhikr = categoryList[0];
        }

        if (nextDhikr) {
            setActiveDhikr({ ...nextDhikr, category });
            setCurrentView('counter');
        }
    };

    const handleDhikrSelect = (dhikrObject) => {
        setCompletionState({ showAameen: false });
        localStorage.removeItem(`tasbih_count_${dhikrObject.id}`);
        setActiveDhikr(dhikrObject);
        setCurrentView('counter');
    };

    // When a single dhikr count completes: auto-advance to NEXT dhikr in same category
    const handleDhikrComplete = () => {
        const category = activeDhikr.category;
        if (!category || !adhkarData[category]) return;

        const currentList = adhkarData[category];
        const currentIndex = currentList.findIndex(item => item.id === activeDhikr.id);

        if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
            // More dhikr in this category — advance to next
            const nextDhikr = currentList[currentIndex + 1];
            localStorage.removeItem(`tasbih_count_${nextDhikr.id}`);
            setActiveDhikr({ ...nextDhikr, category });
        } else {
            // ALL dhikr in this category are done — show Aameen
            setCompletionState({ showAameen: true });
        }
    };

    // Reset = restart category from first dhikr
    const handleSubcategoryReset = () => {
        const category = activeDhikr.category;
        if (!category || !adhkarData[category]) return;

        const categoryList = adhkarData[category];
        // Clear all counts for this category
        categoryList.forEach(item => {
            localStorage.removeItem(`tasbih_count_${item.id}`);
        });

        const firstDhikr = categoryList[0];
        if (firstDhikr) {
            setActiveDhikr({ ...firstDhikr, category });
            setCategoryProgress(prev => ({
                ...prev,
                [category]: firstDhikr.id
            }));
        }
        setCompletionState({ showAameen: false });
    };

    // Check if current dhikr is last in its category
    const isLastInCategory = (() => {
        const category = activeDhikr.category;
        if (!category || !adhkarData[category]) return true;
        const list = adhkarData[category];
        const idx = list.findIndex(item => item.id === activeDhikr.id);
        return idx === list.length - 1;
    })();

    return (
        <Layout>
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {currentView === 'counter' && (
                    <TasbihCounter
                        key={activeDhikr.id + (completionState.showAameen ? '-aameen' : '')}
                        activeDhikr={activeDhikr}
                        adhkarData={adhkarData}
                        onSelectCategory={handleCategorySelect}
                        onComplete={handleDhikrComplete}
                        onResetCategory={handleSubcategoryReset}
                        showAameen={completionState.showAameen}
                        isLastInCategory={isLastInCategory}
                    />
                )}

                {currentView === 'adhkar' && (
                    <AdhkarList
                        adhkarData={adhkarData}
                        setAdhkarData={setAdhkarData}
                        onSelect={handleDhikrSelect}
                        initialCategory={activeDhikr.category}
                    />
                )}

                {currentView === 'settings' && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Settings</h2>
                        <p style={{ fontSize: '14px' }}>Coming soon — Prayer Times, Notifications & more</p>
                    </div>
                )}
            </div>

            <BottomNav currentView={currentView} onViewChange={setCurrentView} />
        </Layout>
    );
}

export default App;
