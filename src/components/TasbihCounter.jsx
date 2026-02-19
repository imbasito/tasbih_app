import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Lock, Unlock, ChevronDown, ChevronUp, SkipForward, ArrowRight, RefreshCw } from 'lucide-react';
import { useTasbih } from '../hooks/useTasbih';
import { useHijriDate } from '../hooks/useHijriDate';
import { useSettings } from '../context/SettingsContext';
import { useAdhkar } from '../context/AdhkarContext';
import { CATEGORY_META } from '../data/adhkar';
import ProgressRing from './counter/ProgressRing';
import AameenOverlay from './counter/AameenOverlay';

// Compute Suhoor & Iftar from actual prayer times stored in localStorage
const getRamadanTimes = () => {
    try {
        const cache = JSON.parse(localStorage.getItem('tasbih_prayer_times_cache') || 'null');
        if (cache?.times) {
            const fajr = cache.times.fajr ? new Date(cache.times.fajr) : null;
            const maghrib = cache.times.maghrib ? new Date(cache.times.maghrib) : null;
            return { suhoor: fajr, iftar: maghrib };
        }
    } catch { /* ignore */ }
    return { suhoor: null, iftar: null };
};

const formatRamadanTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getCountdown = (target) => {
    if (!target) return null;
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const TasbihCounter = ({ recordCount, focusLocked, onToggleFocusLock, showAameen }) => {
    const { settings } = useSettings();
    const { activeDhikr, adhkarData, selectCategory, handleDhikrComplete, handleResetCategory, handleNextDhikr } = useAdhkar();

    const { count, increment, reset, progress } = useTasbih(
        activeDhikr.id, 0, activeDhikr.count || 33, handleDhikrComplete, recordCount
    );

    const hijri = useHijriDate();
    const [textExpanded, setTextExpanded] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState('idle');
    const [ramadanTimes, setRamadanTimes] = useState({ suhoor: null, iftar: null });
    const [ameenParticles] = useState(() => Array.from({ length: 12 }, (_, i) => i));

    const breathingMode = settings?.breathingMode;
    const ramadanMode = settings?.ramadanMode || hijri.isRamadan;

    // Breathing animation cycle
    useEffect(() => {
        if (!breathingMode) { setBreathingPhase('idle'); return; }
        let phase = 'in';
        setBreathingPhase('in');
        const interval = setInterval(() => {
            phase = phase === 'in' ? 'out' : 'in';
            setBreathingPhase(phase);
        }, 4000);
        return () => clearInterval(interval);
    }, [breathingMode]);

    // Ramadan timings — from cached prayer times (Fajr = Suhoor end, Maghrib = Iftar)
    useEffect(() => {
        if (!ramadanMode) return;
        const update = () => setRamadanTimes(getRamadanTimes());
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [ramadanMode]);

    const allCategories = Object.keys(adhkarData || {});
    const currentCatItems = adhkarData?.[activeDhikr.category] || [];
    const currentIndex = currentCatItems.findIndex(d => d.id === activeDhikr.id);
    const isLastDhikr = currentIndex >= currentCatItems.length - 1;

    const breathingScale = breathingMode ? (breathingPhase === 'in' ? 1.08 : 1.0) : 1.0;

    const handleTap = useCallback(() => {
        if (showAameen) return;
        increment();
    }, [increment, showAameen]);

    const handleSkipNext = useCallback((e) => {
        e?.stopPropagation();
        handleNextDhikr();
    }, [handleNextDhikr]);

    const handleResetAll = useCallback((e) => {
        e?.stopPropagation();
        if (window.confirm('Reset all dhikr counts in this category?')) {
            handleResetCategory();
        }
    }, [handleResetCategory]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '10px',
            position: 'relative',
        }}>

            {/* ── Top Bar: Hijri Date + Lock ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-family-arabic)', direction: 'rtl' }}>
                        {hijri.arabicString}
                    </span>
                    {hijri.isSpecial && <span style={{ fontSize: '13px' }}>✨</span>}
                </div>
                <button
                    onClick={onToggleFocusLock}
                    aria-label={focusLocked ? 'Unlock focus mode' : 'Lock focus mode'}
                    aria-pressed={focusLocked}
                    style={{
                        background: focusLocked ? 'var(--accent-primary)' : 'var(--bg-glass)',
                        backdropFilter: focusLocked ? 'none' : 'var(--blur-glass-light)',
                        WebkitBackdropFilter: focusLocked ? 'none' : 'var(--blur-glass-light)',
                        border: focusLocked ? 'none' : '1px solid var(--bg-glass-border)',
                        borderRadius: '10px', padding: '7px 9px',
                        cursor: 'pointer',
                        color: focusLocked ? '#fff' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center',
                        boxShadow: focusLocked ? 'var(--nav-active-glow)' : 'var(--shadow-glass)',
                    }}
                >
                    {focusLocked ? <Lock size={15} /> : <Unlock size={15} />}
                </button>
            </div>

            {/* ── Ramadan Banner with Sehri & Iftar ── */}
            {ramadanMode && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(45,106,79,0.1))',
                    border: '1px solid var(--accent-gold)', borderRadius: '12px',
                    padding: '9px 14px', flexShrink: 0,
                    boxShadow: 'var(--shadow-glass)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>🌙 Ramadan Mubarak</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                            {hijri.arabicString}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
                        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 8px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>SEHRI</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-family-counter)' }}>
                                {formatRamadanTime(ramadanTimes.suhoor)}
                            </div>
                            {getCountdown(ramadanTimes.suhoor) && (
                                <div style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>in {getCountdown(ramadanTimes.suhoor)}</div>
                            )}
                        </div>
                        <div style={{ width: '1px', background: 'rgba(212,168,67,0.3)' }} />
                        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 8px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>IFTAR</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-family-counter)' }}>
                                {formatRamadanTime(ramadanTimes.iftar)}
                            </div>
                            {getCountdown(ramadanTimes.iftar) && (
                                <div style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>in {getCountdown(ramadanTimes.iftar)}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Category Selector ── */}
            <div style={{ overflowX: 'auto', paddingBottom: '2px', flexShrink: 0 }} className="scroll-x">
                <div style={{ display: 'flex', gap: '7px', width: 'max-content', padding: '2px 0' }}>
                    {allCategories.map(cat => {
                        const meta = CATEGORY_META[cat] || { icon: '📿', label: cat };
                        const isActive = cat === activeDhikr.category;
                        return (
                            <button
                                key={cat}
                                className={`category-pill ${isActive ? 'active' : ''}`}
                                onClick={() => selectCategory(cat)}
                                aria-pressed={isActive}
                            >
                                <span style={{ color: isActive ? '#fff' : undefined }}>{meta.icon}</span>
                                <span>{meta.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Progress Ring (fills remaining space) ── */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <ProgressRing
                    count={count}
                    target={activeDhikr.count || 33}
                    progress={progress}
                    breathingScale={breathingScale}
                    breathingMode={breathingMode}
                    showAameen={showAameen}
                    onTap={handleTap}
                />

                {/* ── Dhikr Text Overlay (floats above ring) ── */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    pointerEvents: 'none', // let ring clicks pass through when collapsed
                }}>
                    <button
                        onClick={() => setTextExpanded(e => !e)}
                        aria-expanded={textExpanded}
                        style={{
                            pointerEvents: 'auto',
                            width: '100%',
                            background: textExpanded
                                ? 'var(--bg-glass-strong)'
                                : 'linear-gradient(180deg, var(--bg-glass-strong) 60%, transparent 100%)',
                            backdropFilter: 'var(--blur-glass)',
                            WebkitBackdropFilter: 'var(--blur-glass)',
                            border: textExpanded ? '1px solid var(--bg-glass-border)' : 'none',
                            borderRadius: textExpanded ? '16px' : '0',
                            padding: textExpanded ? '14px 16px 20px' : '10px 14px 24px',
                            cursor: 'pointer',
                            textAlign: 'right',
                            fontFamily: 'inherit',
                            boxShadow: textExpanded ? 'var(--shadow-glass)' : 'none',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-family-arabic)',
                            fontSize: '19px',
                            lineHeight: '1.9',
                            textAlign: 'right',
                            direction: 'rtl',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            // Always show 3 lines; expand to scrollable if user taps
                            display: '-webkit-box',
                            WebkitLineClamp: textExpanded ? 'unset' : 3,
                            WebkitBoxOrient: 'vertical',
                            maxHeight: textExpanded ? '160px' : undefined,
                            overflowY: textExpanded ? 'auto' : 'hidden',
                            // Hidden scrollbar
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}>
                            {activeDhikr.text}
                        </div>
                        {textExpanded && activeDhikr.translation && (
                            <div style={{
                                fontSize: '11px', color: 'var(--text-secondary)',
                                marginTop: '6px', lineHeight: '1.5', textAlign: 'left',
                                overflowY: 'auto', maxHeight: '60px',
                                scrollbarWidth: 'none',
                            }}>
                                {activeDhikr.translation}
                            </div>
                        )}
                        <div style={{
                            position: 'absolute', bottom: textExpanded ? '8px' : '12px',
                            right: textExpanded ? '12px' : '50%',
                            transform: textExpanded ? 'none' : 'translateX(50%)',
                            color: 'var(--text-secondary)', opacity: 0.6,
                        }}>
                            {textExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Footer Controls (hidden in focus lock) ── */}
            {!focusLocked && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 2px', flexShrink: 0 }}>
                    <button
                        onClick={reset}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'var(--bg-glass)',
                            backdropFilter: 'var(--blur-glass-light)',
                            WebkitBackdropFilter: 'var(--blur-glass-light)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '14px', padding: '10px 14px',
                            cursor: 'pointer', color: 'var(--text-secondary)',
                            fontSize: '13px', fontFamily: 'inherit',
                            boxShadow: 'var(--shadow-glass)',
                        }}
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Skip (only when not last) */}
                        {!isLastDhikr && (
                            <button
                                onClick={handleSkipNext}
                                title="Skip"
                                style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-glass)',
                                    backdropFilter: 'var(--blur-glass-light)',
                                    WebkitBackdropFilter: 'var(--blur-glass-light)',
                                    border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '14px', padding: '10px 12px',
                                    cursor: 'pointer', color: 'var(--text-secondary)',
                                    boxShadow: 'var(--shadow-glass)',
                                }}
                            >
                                <SkipForward size={14} />
                            </button>
                        )}
                    </div>

                    {isLastDhikr ? (
                        <button
                            onClick={handleResetAll}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'var(--bg-glass)',
                                backdropFilter: 'var(--blur-glass-light)',
                                WebkitBackdropFilter: 'var(--blur-glass-light)',
                                border: '1px solid var(--bg-glass-border)',
                                borderRadius: '14px', padding: '10px 14px',
                                cursor: 'pointer', color: 'var(--text-secondary)',
                                fontSize: '13px', fontFamily: 'inherit',
                                boxShadow: 'var(--shadow-glass)',
                            }}
                        >
                            <RefreshCw size={14} />
                            <span>Reset All</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSkipNext}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                borderRadius: '14px', padding: '10px 14px',
                                cursor: 'pointer', color: '#fff',
                                fontSize: '13px', fontFamily: 'inherit', fontWeight: '600',
                                boxShadow: 'var(--nav-active-glow)',
                            }}
                        >
                            <span>Next</span>
                            <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}

            {/* ── Aameen Overlay ── */}
            {showAameen && (
                <AameenOverlay
                    category={activeDhikr.category}
                    particles={ameenParticles}
                    onReset={handleResetCategory}
                    onDone={handleResetCategory}
                />
            )}
        </div>
    );
};

export default TasbihCounter;
