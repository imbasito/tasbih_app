import React, { useState, useMemo } from 'react';
import { MapPin, RefreshCw, Bell, BellOff, Edit2, X, Navigation, Search } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useSettings } from '../context/SettingsContext';
import { PAKISTAN_CITIES } from '../data/pakistanCities';

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

// Glass style
const glassStyle = {
    background: 'var(--bg-glass)',
    backdropFilter: 'var(--blur-glass)',
    WebkitBackdropFilter: 'var(--blur-glass)',
    border: '1px solid var(--bg-glass-border)',
    boxShadow: 'var(--shadow-glass)',
};

// Province labels
const PROVINCE_ORDER = ['Islamabad', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'GB', 'International'];
const PROVINCE_LABELS = {
    Islamabad: '🏛️ Islamabad',
    Punjab: '🌾 Punjab',
    Sindh: '🏙️ Sindh',
    KPK: '⛰️ Khyber Pakhtunkhwa',
    Balochistan: '🏕️ Balochistan',
    AJK: '🏔️ Azad Kashmir',
    GB: '🗻 Gilgit-Baltistan',
    International: '🌍 International',
};

const PrayerTimesView = () => {
    const { settings, updateSetting } = useSettings();
    const { times, nextPrayer, countdown, location, loading, error, refresh, isManual, setManualLocation, clearManualLocation } = usePrayerTimes();

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationMode, setLocationMode] = useState(null); // null | 'city'
    const [citySearch, setCitySearch] = useState('');

    const notifications = settings?.notifications || {};
    const toggleNotification = (prayer) => {
        updateSetting('notifications', {
            ...notifications,
            [prayer]: notifications[prayer] === false ? true : false
        });
    };

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const handleQuickCity = async (city) => {
        setShowLocationModal(false);
        setLocationMode(null);
        setCitySearch('');
        await setManualLocation(city.lat, city.lng, city.name);
    };

    const handleUseGPS = async () => {
        setShowLocationModal(false);
        setLocationMode(null);
        clearManualLocation();
    };

    // Filter cities based on search query
    const filteredCities = useMemo(() => {
        if (!citySearch.trim()) return PAKISTAN_CITIES;
        const q = citySearch.toLowerCase().trim();
        return PAKISTAN_CITIES.filter(c =>
            c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
        );
    }, [citySearch]);

    // Group filtered cities by province
    const groupedCities = useMemo(() => {
        const groups = {};
        filteredCities.forEach(city => {
            if (!groups[city.province]) groups[city.province] = [];
            groups[city.province].push(city);
        });
        return groups;
    }, [filteredCities]);

    const orderedProvinces = PROVINCE_ORDER.filter(p => groupedCities[p]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Prayer Times</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={() => { setShowLocationModal(true); setLocationMode(null); }}
                        title="Set location"
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
                            ? (location.city || `${location.lat?.toFixed(2)}°, ${location.lng?.toFixed(2)}°`)
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
                    borderRadius: '20px', padding: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative', overflow: 'hidden',
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

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Getting prayer times...
                </div>
            )}
            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '12px', fontSize: '13px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                    <button
                        onClick={() => setShowLocationModal(true)}
                        style={{ display: 'block', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600', padding: 0 }}
                    >
                        → Set your location
                    </button>
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
                                borderRadius: '16px', padding: '14px 16px',
                                display: 'flex', alignItems: 'center', gap: '14px',
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
                                        fontSize: '16px', fontWeight: '700',
                                        color: isNext ? 'var(--accent-primary)' : isPast ? 'var(--text-secondary)' : 'var(--text-primary)',
                                        fontFamily: 'var(--font-family-counter)',
                                    }}>
                                        {formatTime(times[prayer])}
                                    </div>
                                    <button onClick={() => toggleNotification(prayer)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: notifEnabled ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    }}>
                                        {notifEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tip */}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Tap 🔔 to mute or enable reminders per prayer
            </div>

            {/* ── Location Modal ── */}
            {showLocationModal && (
                <div
                    onClick={() => { setShowLocationModal(false); setLocationMode(null); setCitySearch(''); }}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        padding: '0 0 24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '28px', padding: '24px',
                            width: 'calc(100% - 32px)', maxWidth: '448px',
                            boxShadow: 'var(--shadow-glass-modal)',
                            animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
                            display: 'flex', flexDirection: 'column', gap: '16px',
                            maxHeight: '85vh', overflow: 'hidden',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {locationMode === 'city' ? 'Select City' : 'Set Location'}
                            </div>
                            <button
                                onClick={() => {
                                    if (locationMode) { setLocationMode(null); setCitySearch(''); }
                                    else { setShowLocationModal(false); }
                                }}
                                style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Mode: Choose GPS or City */}
                        {!locationMode && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* GPS Location button */}
                                <button
                                    onClick={handleUseGPS}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '16px 18px', borderRadius: '18px',
                                        background: 'var(--accent-primary)', border: 'none',
                                        cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
                                        textAlign: 'left', boxShadow: 'var(--nav-active-glow)',
                                    }}
                                >
                                    <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Navigation size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '700' }}>Use My Location</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>Auto-detect via GPS</div>
                                    </div>
                                </button>

                                {/* City search button */}
                                <button
                                    onClick={() => setLocationMode('city')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '16px 18px', borderRadius: '18px',
                                        background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                        cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit',
                                        textAlign: 'left', boxShadow: 'var(--shadow-glass)',
                                    }}
                                >
                                    <div style={{ width: '42px', height: '42px', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={20} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '700' }}>Select City</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Search Pakistan &amp; worldwide cities</div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Mode: City search */}
                        {locationMode === 'city' && (
                            <>
                                {/* Search input */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search city, district, town..."
                                        value={citySearch}
                                        onChange={e => setCitySearch(e.target.value)}
                                        style={{
                                            width: '100%', padding: '11px 12px 11px 36px', boxSizing: 'border-box',
                                            background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                            borderRadius: '14px', color: 'var(--text-primary)',
                                            fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                        }}
                                    />
                                    {citySearch && (
                                        <button
                                            onClick={() => setCitySearch('')}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* City list */}
                                <div style={{
                                    overflowY: 'auto', flex: 1,
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--bg-glass-border) transparent',
                                }}>
                                    {orderedProvinces.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                            No cities found
                                        </div>
                                    ) : (
                                        orderedProvinces.map(province => (
                                            <div key={province} style={{ marginBottom: '8px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 2px 6px' }}>
                                                    {PROVINCE_LABELS[province]}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {groupedCities[province].map(city => (
                                                        <button
                                                            key={city.name}
                                                            onClick={() => handleQuickCity(city)}
                                                            style={{
                                                                padding: '7px 13px', borderRadius: '20px',
                                                                background: city.name === location?.city ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                                                border: `1px solid ${city.name === location?.city ? 'var(--accent-primary)' : 'var(--bg-glass-border)'}`,
                                                                cursor: 'pointer', fontSize: '13px',
                                                                color: city.name === location?.city ? '#fff' : 'var(--text-primary)',
                                                                fontFamily: 'inherit', fontWeight: '500',
                                                            }}
                                                        >
                                                            {city.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrayerTimesView;
