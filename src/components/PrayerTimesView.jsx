import React, { useState } from 'react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Clock, MapPin, RefreshCw } from 'lucide-react';

const PrayerTimesView = () => {
    const { prayerTimes, nextPrayer, error, location } = usePrayerTimes();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Force reload of page to re-trigger geolocation as a simple fix
        // In a production app we'd expose a refresh method from the hook
        window.location.reload(); 
    };

    if (error) {
        return (
            <div className="fluent-card" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: '16px',
                padding: '32px',
                textAlign: 'center'
            }}>
                <div style={{ color: 'var(--system-error)', fontWeight: '600' }}>
                    Unable to get location
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {error}
                </div>
                <button 
                    className="fluent-button fluent-button-primary"
                    onClick={handleRefresh}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <RefreshCw size={16} />
                    <span>Retry Location</span>
                </button>
            </div>
        );
    }

    if (!prayerTimes) {
        return (
            <div className="fluent-card" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="loading-spinner" style={{ 
                        width: '24px', 
                        height: '24px', 
                        border: '3px solid var(--brand-light)', 
                        borderTopColor: 'var(--brand-primary)', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <div style={{ color: 'var(--text-secondary)' }}>Loading prayer times...</div>
                    {/* Fallback if stuck */}
                    <button 
                        className="fluent-button"
                        onClick={handleRefresh}
                        style={{ marginTop: '8px', fontSize: '12px' }}
                    >
                        Refresh
                    </button>
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const prayers = [
        { name: 'Fajr', time: prayerTimes.fajr },
        { name: 'Sunrise', time: prayerTimes.sunrise },
        { name: 'Dhuhr', time: prayerTimes.dhuhr },
        { name: 'Asr', time: prayerTimes.asr },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isha', time: prayerTimes.isha },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-l)' }}>
            {/* Header with Location */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'var(--font-weight-semibold)' }}>Prayer Times</h2>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--neutral-layer-card)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    boxShadow: 'var(--elevation-4)'
                }}>
                   <MapPin size={12} />
                   <span>
                       {location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Locating...'}
                   </span>
                </div>
            </div>

            {/* Current/Next Highlight Card */}
            {nextPrayer && (
                <div className="fluent-card" style={{
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-hover))',
                    color: 'var(--brand-foreground)',
                    textAlign: 'center',
                    padding: 'var(--spacing-xl)',
                    boxShadow: 'var(--elevation-8)',
                    border: 'none',
                    marginTop: 'var(--spacing-s)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '13px', 
                        opacity: 0.9,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: '600'
                    }}>
                        <Clock size={14} />
                        <span>Next Prayer</span>
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: '300', margin: '8px 0' }}>
                        {nextPrayer.next}
                    </div>
                    <div style={{ fontSize: '20px', opacity: 0.9, fontWeight: '400' }}>
                        {nextPrayer.nextTime ? formatTime(nextPrayer.nextTime) : '--:--'}
                    </div>
                </div>
            )}

            {/* List of all prayers */}
            <div className="fluent-card" style={{ padding: 0, overflow: 'hidden', marginTop: 'var(--spacing-s)' }}>
                {prayers.map((prayer, index) => {
                    const isNext = nextPrayer?.next?.toLowerCase() === prayer.name.toLowerCase();
                    const isCurrent = nextPrayer?.current?.toLowerCase() === prayer.name.toLowerCase();
                    
                    // Special styling for current prayer
                    const rowStyle = {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px var(--spacing-l)',
                        borderBottom: index < prayers.length - 1 ? '1px solid var(--neutral-layer-2)' : 'none',
                        backgroundColor: isCurrent ? 'var(--brand-light)' : 'transparent',
                        color: isCurrent ? 'var(--brand-primary)' : 'inherit',
                        transition: 'background-color 0.2s'
                    };

                    return (
                        <div key={prayer.name} style={rowStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ 
                                    fontWeight: isCurrent || isNext ? '600' : '400',
                                    fontSize: '15px'
                                }}>{prayer.name}</span>
                                {isCurrent && <span style={{ 
                                    fontSize: '9px', 
                                    backgroundColor: 'var(--brand-primary)', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>NOW</span>}
                            </div>
                            <span style={{ 
                                fontFamily: 'var(--font-family-base)', 
                                fontSize: '15px',
                                fontWeight: isCurrent ? '600' : '400'
                            }}>
                                {formatTime(prayer.time)}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-disabled)', marginTop: 'var(--spacing-m)' }}>
                Calculation Source: Muslim World League
            </div>
        </div>
    );
};

export default PrayerTimesView;
