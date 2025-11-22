import React, { useEffect, useState, useRef } from 'react';
import { 
    RotateCcw, ChevronDown, X, Check, RotateCw, 
    Sun, Moon, BookOpen, Heart, List, LayoutGrid 
} from 'lucide-react';
import { useTasbih } from '../hooks/useTasbih';

const TasbihCounter = ({ activeDhikr, onSelectCategory, onComplete, onResetCategory, adhkarData, showAameen }) => {
    const targetCount = activeDhikr.count || 33;
    const { count, increment, reset } = useTasbih(activeDhikr.id, 0, targetCount);
    const [isResetConfirming, setIsResetConfirming] = useState(false);
    const [isCategoryResetConfirming, setIsCategoryResetConfirming] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const remaining = Math.max(0, targetCount - count);
    const isComplete = count >= targetCount;

    const formatCategory = (cat) => {
        if (!cat) return '';
        return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const currentCategory = activeDhikr.category || 'general';
    const categoryLabel = formatCategory(currentCategory);

    const getCategoryIcon = (cat) => {
        const c = cat.toLowerCase();
        if (c.includes('morning') || c.includes('fajr')) return <Sun size={18} />;
        if (c.includes('evening') || c.includes('maghrib')) return <Moon size={18} />;
        if (c.includes('quran')) return <BookOpen size={18} />;
        if (c.includes('prayer') || c.includes('salah')) return <Heart size={18} />;
        if (c.includes('general')) return <LayoutGrid size={18} />;
        return <List size={18} />;
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
    
    // Subcategory Reset Handlers
    const handleCategoryResetClick = (e) => {
        e.stopPropagation();
        setIsCategoryResetConfirming(true);
    };

    const confirmCategoryReset = (e) => {
        e.stopPropagation();
        onResetCategory && onResetCategory();
        setIsCategoryResetConfirming(false);
    };

    const cancelCategoryReset = (e) => {
        e.stopPropagation();
        setIsCategoryResetConfirming(false);
    };

    const handleCategorySelect = (cat) => {
        if (onSelectCategory) {
            onSelectCategory(cat);
        }
        setIsDropdownOpen(false);
    };

    const handleMainClick = () => {
        if (showAameen) {
            onResetCategory && onResetCategory();
        } else {
            increment();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingTop: 'var(--spacing-s)', // Minimal top padding
            gap: '0', 
            position: 'relative',
            overflow: 'hidden', // STRICT NO SCROLL
            boxSizing: 'border-box',
            paddingBottom: '0px' // Ensure no bottom padding
        }}>
            {/* Header - Reduced margin */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '4px', // Reduced margin
                alignItems: 'stretch', 
                position: 'relative', 
                zIndex: 100,
                height: '52px', // Slightly more compact
                flexShrink: 0 
            }}>
                 <div ref={dropdownRef} style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                     <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '0 12px',
                            borderRadius: '14px',
                            backgroundColor: isDropdownOpen ? 'var(--neutral-layer-card)' : 'var(--neutral-layer-2)',
                            border: isDropdownOpen ? '1px solid var(--brand-primary)' : '1px solid transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            overflow: 'hidden',
                            boxShadow: isDropdownOpen ? '0 0 0 2px rgba(0, 120, 212, 0.1)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--brand-light)',
                            color: 'var(--brand-primary)',
                            flexShrink: 0
                        }}>
                            {getCategoryIcon(currentCategory)}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                            <span style={{
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '2px'
                            }}>
                                Current Category
                            </span>
                            <span style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                                width: '100%'
                            }}>
                                {categoryLabel}
                            </span>
                        </div>
                        <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                    </button>

                    {isDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            backgroundColor: 'var(--neutral-layer-card)',
                            borderRadius: '12px',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)',
                            border: '1px solid var(--neutral-layer-2)',
                            maxHeight: '50vh', 
                            overflowY: 'auto',
                            zIndex: 1000,
                            animation: 'fadeIn 0.15s cubic-bezier(0.33, 1, 0.68, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '4px'
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
                                            gap: '12px',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.1s'
                                        }}
                                        onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'var(--neutral-layer-1)')}
                                        onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <div style={{
                                            color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            {getCategoryIcon(category)}
                                        </div>
                                        <div style={{ flex: 1, fontSize: '14px', fontWeight: isActive ? '600' : '500', color: 'var(--text-primary)' }}>
                                            {formatCategory(category)}
                                        </div>
                                        {isActive && <Check size={16} color="var(--brand-primary)" flexShrink={0} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                 </div>
                
                {/* Category Reset Button with Fluent Popup */}
                {!isCategoryResetConfirming ? (
                    <button 
                        onClick={handleCategoryResetClick}
                        title={`Restart ${categoryLabel}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '52px', // Match height roughly
                            height: '100%',
                            borderRadius: '14px',
                            backgroundColor: 'var(--neutral-layer-2)',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            flexShrink: 0,
                            transition: 'all 0.2s'
                        }}
                    >
                        <RotateCw size={20} strokeWidth={2} />
                    </button>
                ) : (
                    <div style={{
                        position: 'absolute',
                        right: 0, top: 0,
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        backgroundColor: 'var(--neutral-layer-card)',
                        borderRadius: '14px',
                        boxShadow: 'var(--elevation-16)',
                        border: '1px solid var(--neutral-layer-2)',
                        zIndex: 1001,
                        animation: 'fadeIn 0.2s',
                        height: '100%',
                        alignItems: 'center'
                    }}>
                         <button
                            onClick={cancelCategoryReset}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '100%',
                                backgroundColor: 'transparent', border: 'none',
                                color: 'var(--text-primary)', cursor: 'pointer',
                                borderRadius: '10px'
                            }}
                        >
                            <X size={18} />
                        </button>
                        <button
                            onClick={confirmCategoryReset}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '100%',
                                backgroundColor: 'var(--brand-primary)', border: 'none',
                                color: 'white', cursor: 'pointer',
                                borderRadius: '10px'
                            }}
                        >
                            <Check size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* 
               Main Dhikr Text Area (Strictly No Scroll, Compact)
            */}
            <div style={{ 
                flex: 1, 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center', 
                padding: '0 16px',
                marginBottom: '8px', // Minimal margin
                overflow: 'hidden', // STRICT NO SCROLL
                width: '100%'
            }}>
                <div style={{
                    width: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <h2 style={{ 
                        fontSize: 'clamp(18px, 5vw, 26px)', // Adjusted max size down slightly
                        fontWeight: '600', 
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        lineHeight: '1.4',
                        fontFamily: '"Segoe UI", "Traditional Arabic", sans-serif',
                        maxHeight: '60vh', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 10, 
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {showAameen ? "تقبل الله منا ومنكم" : activeDhikr.text}
                    </h2>
                    
                    {!showAameen && activeDhikr.translation && (
                        <p style={{ 
                            fontSize: 'clamp(11px, 3.5vw, 14px)', 
                            color: 'var(--text-secondary)',
                            maxWidth: '95%',
                            margin: '0 auto',
                            maxHeight: '15vh',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {activeDhikr.translation}
                        </p>
                    )}
                </div>
            </div>

            {/* Counter Reset Action - Only show if NOT in Aameen state */}
            {!showAameen && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '16px', // Reduced
                    minHeight: '32px', 
                    flexShrink: 0 
                }}>
                    {!isResetConfirming ? (
                         <button
                            onClick={handleResetClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px', // Compact padding
                                backgroundColor: 'var(--neutral-layer-card)',
                                border: '1px solid var(--neutral-layer-2)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                boxShadow: 'var(--elevation-4)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>
                    ) : (
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '4px',
                            backgroundColor: 'var(--neutral-layer-card)',
                            borderRadius: '24px',
                            boxShadow: 'var(--elevation-16)',
                            border: '1px solid var(--neutral-layer-2)'
                        }}>
                             <button
                                onClick={cancelReset}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                <X size={14} />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={confirmReset}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    backgroundColor: 'var(--brand-primary)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                <Check size={14} />
                                <span>Confirm</span>
                            </button>
                        </div>
                    )}
                 </div>
            )}

            {/* Count Display / Tap Area */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px', // Tighter gap
                paddingBottom: '8px', // Minimal bottom padding
                flexShrink: 0,
                zIndex: 1
            }}>
                <div
                    onClick={handleMainClick}
                    style={{
                        width: 'min(60vw, 260px)', // Compact circle
                        height: 'min(60vw, 260px)',
                        borderRadius: '50%',
                        backgroundColor: 'var(--neutral-layer-card)',
                        boxShadow: 'var(--elevation-16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        border: '1px solid rgba(0,0,0,0.04)',
                        position: 'relative',
                        transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                        WebkitTapHighlightColor: 'transparent',
                        outline: 'none'
                    }}
                    className="counter-btn"
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {!showAameen && (
                        <div style={{
                            position: 'absolute',
                            top: -5, left: -5, right: -5, bottom: -5,
                            borderRadius: '50%',
                            border: `5px solid ${isComplete ? 'var(--system-success)' : 'var(--brand-light)'}`, 
                            zIndex: -1,
                            transition: 'border-color 0.3s ease'
                        }} />
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px', textAlign: 'center' }}>
                        <span style={{
                            fontSize: showAameen ? '42px' : 'clamp(60px, 15vw, 80px)',
                            fontWeight: showAameen ? '600' : '300',
                            color: showAameen ? 'var(--system-success)' : (isComplete ? 'var(--system-success)' : 'var(--brand-primary)'),
                            lineHeight: 1,
                            fontFamily: showAameen ? '"Segoe UI", "Traditional Arabic", sans-serif' : 'var(--font-family-base)',
                            transition: 'all 0.3s ease'
                        }}>
                            {showAameen ? "آمين" : count}
                        </span>
                        <span style={{ 
                            fontSize: '12px',
                            color: 'var(--text-secondary)', 
                            marginTop: showAameen ? '8px' : '4px',
                            fontWeight: '500'
                        }}>
                            {showAameen ? "Tap to Restart" : "Tap to Count"}
                        </span>
                    </div>
                </div>

                {!showAameen && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Remaining
                        </span>
                        <span style={{
                            fontSize: '18px',
                            fontWeight: '300',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-family-base)'
                        }}>
                            {remaining}
                        </span>
                    </div>
                )}
            </div>
            
            {/* NO FOOTER HERE - REMOVED COPYRIGHT AS REQUESTED */}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); scale(0.98); } to { opacity: 1; transform: translateY(0); scale(1); } }
            `}</style>
        </div>
    );
};

export default TasbihCounter;
