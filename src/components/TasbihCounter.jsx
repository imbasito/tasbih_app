import React, { useEffect, useState, useRef } from 'react';
import {
    RotateCcw, ChevronDown, X, Check, RotateCw,
    Sun, Moon, BookOpen, Heart, List, LayoutGrid, ChevronRight
} from 'lucide-react';
import { useTasbih } from '../hooks/useTasbih';

// Simple Hijri date approximation
const getHijriDate = () => {
    const gregorian = new Date();
    // Approximate Hijri calculation (good enough for display)
    const jd = Math.floor((11 * gregorian.getFullYear() + 3) / 30) +
        354 * gregorian.getFullYear() +
        30 * (gregorian.getMonth() + 1) -
        Math.floor((gregorian.getMonth() + 1 - 1) / 2) +
        gregorian.getDate() - 385;

    // Use a more reliable epoch-based approach
    const epoch = new Date(622, 6, 16).getTime();
    const diff = gregorian.getTime() - epoch;
    const lunarYear = 354.36667;
    const lunarMonth = 29.53059;
    const totalDays = diff / (1000 * 60 * 60 * 24);

    const hijriYear = Math.floor(totalDays / lunarYear);
    const remainingDays = totalDays - (hijriYear * lunarYear);
    const hijriMonth = Math.floor(remainingDays / lunarMonth) + 1;
    const hijriDay = Math.floor(remainingDays - ((hijriMonth - 1) * lunarMonth)) + 1;

    const months = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    const toArabicNum = (num) => {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return String(num).split('').map(d => arabicDigits[parseInt(d)] || d).join('');
    };

    const monthIdx = Math.max(0, Math.min(11, hijriMonth - 1));
    return `${toArabicNum(Math.abs(hijriDay))} ${months[monthIdx]} ${toArabicNum(Math.abs(hijriYear))} هـ`;
};

const TasbihCounter = ({ activeDhikr, onSelectCategory, onComplete, onResetCategory, adhkarData, showAameen, onNextDhikr, isLastInCategory }) => {
    const targetCount = activeDhikr.count || 33;
    const { count, increment, reset } = useTasbih(activeDhikr.id, 0, targetCount);
    const [isResetConfirming, setIsResetConfirming] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const dropdownRef = useRef(null);
    const [hijriDate] = useState(getHijriDate);

    const remaining = Math.max(0, targetCount - count);
    const isComplete = count >= targetCount;
    const progress = Math.min(1, count / targetCount);

    // SVG progress ring calculations
    const circleSize = 240;
    const strokeWidth = 6;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const formatCategory = (cat) => {
        if (!cat) return '';
        return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const currentCategory = activeDhikr.category || 'general';
    const categoryLabel = formatCategory(currentCategory);

    const getCategoryIcon = (cat) => {
        const c = cat.toLowerCase();
        if (c.includes('morning') || c.includes('fajr')) return <Sun size={16} />;
        if (c.includes('evening') || c.includes('maghrib')) return <Moon size={16} />;
        if (c.includes('quran')) return <BookOpen size={16} />;
        if (c.includes('prayer') || c.includes('salah')) return <Heart size={16} />;
        if (c.includes('general')) return <LayoutGrid size={16} />;
        return <List size={16} />;
    };

    const sortOrder = ['morning', 'evening', 'after-prayer', 'quran', 'general'];
    const allCategories = adhkarData ? Object.keys(adhkarData).sort((a, b) => {
        const idxA = sortOrder.indexOf(a.toLowerCase());
        const idxB = sortOrder.indexOf(b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    }) : [];

    useEffect(() => {
        if (isComplete && onComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isComplete, onComplete]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleResetClick = (e) => {
        e.stopPropagation();
        setIsResetConfirming(true);
    };

    const confirmReset = (e) => {
        e.stopPropagation();
        reset();
        setIsResetConfirming(false);
    };

    const cancelReset = (e) => {
        e.stopPropagation();
        setIsResetConfirming(false);
    };

    const handleCategorySelect = (cat) => {
        if (onSelectCategory) {
            onSelectCategory(cat);
        }
        setIsDropdownOpen(false);
    };

    const handleMainClick = () => {
        if (!showAameen) {
            increment();
        }
    };

    // Get current position in category
    const currentList = adhkarData[currentCategory] || [];
    const currentIndex = currentList.findIndex(item => item.id === activeDhikr.id);
    const totalInCategory = currentList.length;

    // Aameen Screen
    if (showAameen) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '24px',
                gap: '24px',
                animation: 'fadeInUp 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
            }}>
                {/* Gold particles effect */}
                <div style={{ fontSize: '24px', letterSpacing: '12px', opacity: 0.6, color: 'var(--accent-gold)' }}>
                    ✦ ✦ ✦ ✦ ✦
                </div>

                <div style={{
                    fontSize: '72px',
                    fontFamily: 'var(--font-family-arabic)',
                    color: 'var(--accent-gold)',
                    fontWeight: '700',
                    lineHeight: 1.2,
                    textShadow: '0 2px 20px rgba(212, 168, 67, 0.3)',
                }}>
                    آمين
                </div>
                <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                }}>
                    تقبل الله منا ومنكم
                </div>

                <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Check size={18} />
                    {categoryLabel} Complete
                </div>

                {/* Two Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                        onClick={() => onResetCategory && onResetCategory()}
                        className="glass-strong"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 24px',
                            border: '1px solid var(--bg-glass-border)',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <RotateCcw size={16} />
                        Restart
                    </button>
                    <button
                        onClick={() => onResetCategory && onResetCategory()}
                        className="btn-accent"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 24px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}
                    >
                        <Check size={16} />
                        Complete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
            {/* Hijri Date Bar */}
            <div style={{
                textAlign: 'center',
                padding: '8px 16px 4px',
                fontSize: '13px',
                fontFamily: 'var(--font-family-arabic)',
                color: 'var(--text-secondary)',
                fontWeight: '400',
                letterSpacing: '0.5px',
                flexShrink: 0,
            }}>
                {hijriDate}
            </div>

            {/* Category Dropdown */}
            <div style={{
                padding: '0 16px 8px',
                flexShrink: 0,
                position: 'relative',
                zIndex: 100
            }}>
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="glass"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 'var(--radius-m)',
                            border: isDropdownOpen ? `1px solid var(--accent-primary)` : '1px solid var(--bg-glass-border)',
                            transition: 'all 0.2s ease',
                            background: isDropdownOpen ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '30px',
                            height: '30px',
                            borderRadius: 'var(--radius-s)',
                            backgroundColor: 'var(--accent-light)',
                            color: 'var(--accent-primary)',
                            flexShrink: 0,
                        }}>
                            {getCategoryIcon(currentCategory)}
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                            }}>
                                {categoryLabel}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                            }}>
                                {currentIndex + 1} of {totalInCategory}
                            </span>
                        </div>
                        <ChevronDown size={18} color="var(--text-secondary)" style={{
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                            flexShrink: 0
                        }} />
                    </button>

                    {isDropdownOpen && (
                        <div className="glass-strong" style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            borderRadius: 'var(--radius-m)',
                            boxShadow: 'var(--elevation-16)',
                            maxHeight: '50vh',
                            overflowY: 'auto',
                            zIndex: 1000,
                            animation: 'fadeIn 0.15s cubic-bezier(0.32, 0.72, 0, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '4px',
                        }}>
                            {allCategories.map(category => {
                                const isActive = category === currentCategory;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => handleCategorySelect(category)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px',
                                            borderRadius: 'var(--radius-s)',
                                            backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                        }}
                                        onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'var(--bg-glass)')}
                                        onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <div style={{
                                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                            {getCategoryIcon(category)}
                                        </div>
                                        <span style={{
                                            flex: 1,
                                            fontSize: '14px',
                                            fontWeight: isActive ? '600' : '500',
                                            color: 'var(--text-primary)',
                                        }}>
                                            {formatCategory(category)}
                                        </span>
                                        {isActive && <Check size={16} color="var(--accent-primary)" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Dhikr Text */}
            <div
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                style={{
                    padding: '0 20px',
                    textAlign: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    maxHeight: isTextExpanded ? '40vh' : '90px',
                    overflow: isTextExpanded ? 'auto' : 'hidden',
                    marginBottom: '8px',
                    position: 'relative',
                }}
            >
                <h2 style={{
                    fontSize: 'clamp(20px, 5.5vw, 28px)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    lineHeight: '1.5',
                    fontFamily: 'var(--font-family-arabic)',
                    display: isTextExpanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: isTextExpanded ? 'unset' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: isTextExpanded ? 'visible' : 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0,
                }}>
                    {activeDhikr.text}
                </h2>

                {activeDhikr.translation && (
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        maxWidth: '90%',
                        margin: '6px auto 0',
                        lineHeight: '1.4',
                        display: isTextExpanded ? 'block' : '-webkit-box',
                        WebkitLineClamp: isTextExpanded ? 'unset' : 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: isTextExpanded ? 'visible' : 'hidden',
                    }}>
                        {activeDhikr.translation}
                    </p>
                )}

                {/* Expand indicator */}
                {!isTextExpanded && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '20px',
                        background: 'linear-gradient(transparent, var(--bg-primary))',
                        pointerEvents: 'none',
                    }} />
                )}
            </div>

            {/* Counter Reset Action */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '8px',
                minHeight: '32px',
                flexShrink: 0,
            }}>
                {!isResetConfirming ? (
                    <button
                        onClick={handleResetClick}
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 16px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                    </button>
                ) : (
                    <div className="glass-strong" style={{
                        display: 'flex',
                        gap: '6px',
                        padding: '4px',
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--elevation-8)',
                    }}>
                        <button
                            onClick={cancelReset}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 14px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '12px',
                                fontWeight: '600',
                            }}
                        >
                            <X size={13} />
                            Cancel
                        </button>
                        <button
                            onClick={confirmReset}
                            className="btn-accent"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '12px',
                                fontWeight: '600',
                            }}
                        >
                            <Check size={13} />
                            Confirm
                        </button>
                    </div>
                )}
            </div>

            {/* Counter Circle with SVG Progress Ring */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                paddingBottom: '8px',
            }}>
                <div
                    onClick={handleMainClick}
                    style={{
                        width: `${circleSize}px`,
                        height: `${circleSize}px`,
                        borderRadius: '50%',
                        position: 'relative',
                        cursor: 'pointer',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        outline: 'none',
                        transition: 'transform 0.12s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                    className="counter-btn"
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {/* SVG Progress Ring */}
                    <svg
                        width={circleSize}
                        height={circleSize}
                        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
                    >
                        {/* Background ring */}
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            fill="none"
                            stroke="var(--bg-glass-border)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress ring */}
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            fill="none"
                            stroke={isComplete ? 'var(--accent-gold)' : 'var(--accent-primary)'}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                transition: 'stroke-dashoffset 0.4s cubic-bezier(0.32, 0.72, 0, 1), stroke 0.3s ease',
                            }}
                        />
                    </svg>

                    {/* Inner glass face */}
                    <div className="glass" style={{
                        position: 'absolute',
                        top: strokeWidth + 8,
                        left: strokeWidth + 8,
                        right: strokeWidth + 8,
                        bottom: strokeWidth + 8,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}>
                        <span style={{
                            fontSize: '64px',
                            fontWeight: '300',
                            color: isComplete ? 'var(--accent-gold)' : 'var(--accent-primary)',
                            lineHeight: 1,
                            fontFamily: 'var(--font-family-counter)',
                            transition: 'color 0.3s ease',
                        }}>
                            {count}
                        </span>
                        <span style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '4px',
                            fontWeight: '500',
                            letterSpacing: '0.5px',
                        }}>
                            / {targetCount}
                        </span>
                    </div>
                </div>

                {/* Remaining count */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    opacity: 0.7,
                }}>
                    <span style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        Remaining
                    </span>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: '300',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-family-counter)',
                    }}>
                        {remaining}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TasbihCounter;
