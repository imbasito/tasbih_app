import React, { useState } from 'react';
import { MapPin, RefreshCw, Bell, BellOff, Edit2, X, Check, Navigation } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useSettings } from '../context/SettingsContext';

const PRAYER_ICONS = { fajr: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌇', isha: '🌙' };
const PRAYER_LABELS = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatCountdown = (ms) => {
    if (!ms || ms < 0) return '';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

// Well-known cities for quick selection
const QUICK_CITIES = [
    { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
    { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
    { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
];

const PrayerTimesView = () => {
    const { settings, updateSetting } = useSettings();
    const { times, nextPrayer, countdown, location, loading, error, refresh, isManual, setManualLocation, clearManualLocation } = usePrayerTimes();

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [latInput, setLatInput] = useState('');
    const [lngInput, setLngInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [locError, setLocError] = useState('');

    const notifications = settings?.notifications || {};
    const toggleNotification = (prayer) => {
        updateSetting('notifications', {
            ...notifications,
            [prayer]: notifications[prayer] === false ? true : false
        });
    };

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const handleManualSubmit = async () => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setLocError('Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180');
            return;
        }
        setLocError('');
        setShowLocationModal(false);
        await setManualLocation(lat, lng, cityInput.trim() || undefined);
    };

    const handleQuickCity = async (city) => {
        setShowLocationModal(false);
        await setManualLocation(city.lat, city.lng, city.name);
    };

    const glassStyle = {
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--bg-glass-border)',
        boxShadow: 'var(--shadow-glass)',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Prayer Times</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={() => setShowLocationModal(true)}
                        title="Set location manually"
                        style={{ ...glassStyle, borderRadius: '10px', padding: '8px', cursor: 'pointer', color: isManual ? 'var(--accent-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={refresh}
                        title="Refresh"
                        style={{ ...glassStyle, borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Location row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={13} color={isManual ? 'var(--accent-gold)' : 'var(--accent-primary)'} />
                    <span>
                        {location
                            ? (location.city || `${location.lat?.toFixed(2)}°N, ${location.lng?.toFixed(2)}°E`)
                            : 'Detecting location...'}
                        {isManual && <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '600' }}>(Manual)</span>}
                    </span>
                </div>
                {isManual && (
                    <button
                        onClick={clearManualLocation}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                        <Navigation size={11} /> Use GPS
                    </button>
                )}
            </div>

            {/* Next Prayer Countdown */}
            {nextPrayer && (
                <div style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--nav-active-glow)',
                }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                    <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '4px' }}>NEXT PRAYER</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                            {PRAYER_ICONS[nextPrayer]} {PRAYER_LABELS[nextPrayer]}
                        </div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                            {times && formatTime(times[nextPrayer])}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '4px' }}>IN</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-family-counter)' }}>
                            {formatCountdown(countdown)}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading / Error */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Getting prayer times...
                </div>
            )}
            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '12px', fontSize: '13px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                    {error.includes('Karachi') || error.includes('unavailable') ? (
                        <button
                            onClick={() => setShowLocationModal(true)}
                            style={{ display: 'block', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600', padding: 0 }}
                        >
                            → Set your location manually
                        </button>
                    ) : null}
                </div>
            )}

            {/* Prayer Cards */}
            {times && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prayers.map((prayer) => {
                        const isNext = prayer === nextPrayer;
                        const isPast = times[prayer] && times[prayer] < new Date();
                        const notifEnabled = notifications[prayer] !== false;

                        return (
                            <div key={prayer} style={{
                                ...glassStyle,
                                background: isNext ? 'var(--accent-light)' : 'var(--bg-glass)',
                                border: `1px solid ${isNext ? 'var(--accent-primary)' : 'var(--bg-glass-border)'}`,
                                borderRadius: '16px',
                                padding: '14px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '22px' }}>{PRAYER_ICONS[prayer]}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: isNext ? '700' : '600',
                                        color: isNext ? 'var(--accent-primary)' : isPast ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    }}>
                                        {PRAYER_LABELS[prayer]}
                                    </div>
                                    {isNext && (
                                        <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '1px' }}>
                                            Next prayer
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: isNext ? 'var(--accent-primary)' : isPast ? 'var(--text-secondary)' : 'var(--text-primary)',
                                        fontFamily: 'var(--font-family-counter)',
                                    }}>
                                        {formatTime(times[prayer])}
                                    </div>
                                    <button onClick={() => toggleNotification(prayer)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: notifEnabled ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        transition: 'color 0.2s',
                                    }}>
                                        {notifEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Method info */}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Muslim World League · Hanafi · Tap 🔔 to toggle notifications
            </div>

            {/* ── Location Modal ── */}
            {showLocationModal && (
                <div
                    onClick={() => setShowLocationModal(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        padding: '0 0 24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'var(--blur-glass)',
                            WebkitBackdropFilter: 'var(--blur-glass)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '28px',
                            padding: '24px',
                            width: 'calc(100% - 32px)',
                            maxWidth: '448px',
                            boxShadow: 'var(--shadow-glass-modal)',
                            animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
                            display: 'flex', flexDirection: 'column', gap: '14px',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>Set Location</div>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Quick cities */}
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Quick Select</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {QUICK_CITIES.map(city => (
                                    <button
                                        key={city.name}
                                        onClick={() => handleQuickCity(city)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '20px',
                                            background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                            cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)',
                                            fontFamily: 'inherit', fontWeight: '500',
                                            boxShadow: 'var(--shadow-glass)',
                                        }}
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Manual coordinates */}
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Manual Coordinates</div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Latitude"
                                    value={latInput}
                                    onChange={e => setLatInput(e.target.value)}
                                    style={{
                                        flex: 1, padding: '10px 12px',
                                        background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                        borderRadius: '12px', color: 'var(--text-primary)',
                                        fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Longitude"
                                    value={lngInput}
                                    onChange={e => setLngInput(e.target.value)}
                                    style={{
                                        flex: 1, padding: '10px 12px',
                                        background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                        borderRadius: '12px', color: 'var(--text-primary)',
                                        fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                    }}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="City name (optional)"
                                value={cityInput}
                                onChange={e => setCityInput(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                                    background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '12px', color: 'var(--text-primary)',
                                    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                    marginBottom: '8px',
                                }}
                            />
                            {locError && <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{locError}</div>}
                            <button
                                onClick={handleManualSubmit}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'var(--accent-primary)', border: 'none',
                                    borderRadius: '14px', color: '#fff',
                                    fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                            >
                                <Check size={16} /> Apply Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrayerTimesView;
