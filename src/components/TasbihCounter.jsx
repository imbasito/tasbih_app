import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Lock, Unlock, ChevronDown, ChevronUp, SkipForward, ArrowRight, RefreshCw } from 'lucide-react';
import { useTasbih } from '../hooks/useTasbih';
import { useHijriDate } from '../hooks/useHijriDate';
import { useSettings } from '../context/SettingsContext';
import { useAdhkar } from '../context/AdhkarContext';
import { CATEGORY_META } from '../data/adhkar';
import ProgressRing from './counter/ProgressRing';
import AameenOverlay from './counter/AameenOverlay';

// Ramadan Suhoor/Iftar countdown
const getRamadanCountdown = () => {
    const now = new Date();
    const suhoor = new Date(now); suhoor.setHours(5, 0, 0, 0);
    const iftar = new Date(now); iftar.setHours(18, 30, 0, 0);
    const target = now < suhoor ? suhoor : now < iftar ? iftar : new Date(suhoor.getTime() + 86400000);
    const label = now < suhoor ? 'Suhoor' : now < iftar ? 'Iftar' : 'Suhoor';
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { label, time: `${h}h ${m}m` };
};

const TasbihCounter = ({ recordCount, focusLocked, onToggleFocusLock, showAameen }) => {
    const { settings, updateSetting } = useSettings();
    const { activeDhikr, adhkarData, selectCategory, handleDhikrComplete, handleResetCategory, handleNextDhikr } = useAdhkar();

    const { count, increment, reset, progress } = useTasbih(
        activeDhikr.id, 0, activeDhikr.count || 33, handleDhikrComplete, recordCount
    );

    const hijri = useHijriDate();
    const [textExpanded, setTextExpanded] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState('idle');
    const [ramadanCountdown, setRamadanCountdown] = useState(null);
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

    // Ramadan countdown
    useEffect(() => {
        if (!ramadanMode) return;
        const update = () => setRamadanCountdown(getRamadanCountdown());
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [ramadanMode]);

    const allCategories = Object.keys(adhkarData || {});
    const currentCatItems = adhkarData?.[activeDhikr.category] || [];
    const currentIndex = currentCatItems.findIndex(d => d.id === activeDhikr.id);
    const isLastDhikr = currentIndex >= currentCatItems.length - 1;
    const position = currentIndex >= 0 ? `${currentIndex + 1} / ${currentCatItems.length}` : '';

    const breathingScale = breathingMode ? (breathingPhase === 'in' ? 1.08 : 1.0) : 1.0;

    const handleTap = useCallback(() => {
        if (showAameen) return;
        increment();
    }, [increment, showAameen]);

    const handleSkip = useCallback((e) => {
        e.stopPropagation();
        handleNextDhikr();
    }, [handleNextDhikr]);

    const handleResetAll = useCallback((e) => {
        e.stopPropagation();
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
            {!focusLocked && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-family-arabic)', direction: 'rtl' }}>
                            {hijri.arabicString}
                        </span>
                        {hijri.isSpecial && <span style={{ fontSize: '13px' }}>✨</span>}
                    </div>
                    <button
                        onClick={onToggleFocusLock}
                        aria-label="Lock focus mode"
                        aria-pressed={false}
                        title="Focus Lock"
                        style={{
                            background: 'var(--bg-glass)',
                            backdropFilter: 'var(--blur-glass-light)',
                            WebkitBackdropFilter: 'var(--blur-glass-light)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '10px', padding: '7px 9px',
                            cursor: 'pointer', color: 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center',
                            boxShadow: 'var(--shadow-glass)',
                        }}
                    >
                        <Unlock size={15} />
                    </button>
                </div>
            )}

            {/* ── Focus Lock: tap to unlock ── */}
            {focusLocked && (
                <button
                    onClick={onToggleFocusLock}
                    aria-label="Unlock focus mode"
                    style={{
                        alignSelf: 'flex-end',
                        background: 'var(--accent-primary)',
                        border: 'none',
                        borderRadius: '10px', padding: '7px 9px',
                        cursor: 'pointer', color: '#fff',
                        display: 'flex', alignItems: 'center',
                        boxShadow: 'var(--nav-active-glow)',
                    }}
                >
                    <Lock size={15} />
                </button>
            )}

            {/* ── Ramadan Banner ── */}
            {ramadanMode && ramadanCountdown && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(45,106,79,0.1))',
                    border: '1px solid var(--accent-gold)', borderRadius: '12px',
                    padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-glass)',
                }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>🌙 Ramadan Mubarak</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        {ramadanCountdown.label}: {ramadanCountdown.time}
                    </span>
                </div>
            )}

            {/* ── Category Selector ── */}
            {!focusLocked && (
                <div style={{ overflowX: 'auto', paddingBottom: '2px' }} className="scroll-x">
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
                                    aria-label={`Select ${meta.label} category`}
                                >
                                    <span style={{ color: isActive ? '#fff' : undefined }}>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Arabic Text — Collapsible (hidden in focus lock) ── */}
            {!focusLocked && (
                <button
                    onClick={() => setTextExpanded(e => !e)}
                    aria-expanded={textExpanded}
                    aria-label={textExpanded ? 'Collapse dhikr text' : 'Expand dhikr text'}
                    style={{
                        background: 'var(--bg-glass)',
                        backdropFilter: 'var(--blur-glass)',
                        WebkitBackdropFilter: 'var(--blur-glass)',
                        border: '1px solid var(--bg-glass-border)',
                        borderRadius: '16px', padding: '14px 16px',
                        cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                        textAlign: 'left', width: '100%', fontFamily: 'inherit',
                        boxShadow: 'var(--shadow-glass)',
                    }}
                >
                    <div style={{
                        fontFamily: 'var(--font-family-arabic)', fontSize: '20px', lineHeight: '2',
                        textAlign: 'right', direction: 'rtl', color: 'var(--text-primary)',
                        overflow: textExpanded ? 'auto' : 'hidden',
                        maxHeight: textExpanded ? '180px' : '64px', transition: 'max-height 0.3s ease',
                    }}>
                        {activeDhikr.text}
                    </div>
                    {activeDhikr.translation && (
                        <div style={{
                            fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px',
                            overflow: textExpanded ? 'auto' : 'hidden',
                            maxHeight: textExpanded ? '80px' : '0px', transition: 'max-height 0.3s ease', lineHeight: '1.5',
                        }}>
                            {activeDhikr.translation}
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '8px', right: '12px', color: 'var(--text-secondary)' }}>
                        {textExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                </button>
            )}

            {/* ── Progress Ring — fills remaining space ── */}
            <ProgressRing
                count={count}
                target={activeDhikr.count || 33}
                progress={progress}
                breathingScale={breathingScale}
                breathingMode={breathingMode}
                showAameen={showAameen}
                onTap={handleTap}
            />

            {/* ── Footer Controls (hidden in focus lock) ── */}
            {!focusLocked && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 2px' }}>
                    {/* Reset current dhikr */}
                    <button
                        onClick={reset}
                        aria-label="Reset current count"
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
                            flexShrink: 0,
                        }}
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>

                    {/* Skip button only (removed position pill) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Skip button */}
                        {!isLastDhikr && (
                            <button
                                onClick={handleSkip}
                                aria-label="Skip to next dhikr"
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

                    {/* Dynamic: Next → or Reset All */}
                    {isLastDhikr ? (
                        <button
                            onClick={handleResetAll}
                            aria-label="Reset all dhikr in category"
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
                                flexShrink: 0,
                            }}
                        >
                            <RefreshCw size={14} />
                            <span>Reset All</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSkip}
                            aria-label="Next dhikr"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                borderRadius: '14px', padding: '10px 14px',
                                cursor: 'pointer', color: '#fff',
                                fontSize: '13px', fontFamily: 'inherit', fontWeight: '600',
                                boxShadow: 'var(--nav-active-glow)',
                                flexShrink: 0,
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
                    onNext={handleNextDhikr}
                />
            )}
        </div>
    );
};

export default TasbihCounter;
