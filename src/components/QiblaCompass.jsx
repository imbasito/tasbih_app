import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Navigation } from 'lucide-react';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const getQiblaAngle = (lat, lng) => {
    const dLng = toRad(KAABA_LNG - lng);
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA_LAT);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const QiblaCompass = ({ onBack }) => {
    const [location, setLocation] = useState(null);
    const [qiblaAngle, setQiblaAngle] = useState(null);
    const [deviceHeading, setDeviceHeading] = useState(0);
    const [accuracy, setAccuracy] = useState('unknown');
    const [error, setError] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // Get GPS location
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, lng: longitude });
                setQiblaAngle(getQiblaAngle(latitude, longitude));
            },
            (err) => setError('Location access denied. Please enable GPS.'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        // Device orientation for compass
        const handleOrientation = (e) => {
            if (e.webkitCompassHeading !== undefined) {
                // iOS
                setDeviceHeading(e.webkitCompassHeading);
                setAccuracy(e.webkitCompassAccuracy < 15 ? 'good' : e.webkitCompassAccuracy < 30 ? 'moderate' : 'poor');
            } else if (e.alpha !== null) {
                // Android
                setDeviceHeading(360 - e.alpha);
                setAccuracy('moderate');
            }
        };

        if (typeof DeviceOrientationEvent !== 'undefined') {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(perm => {
                        if (perm === 'granted') {
                            setPermissionGranted(true);
                            window.addEventListener('deviceorientation', handleOrientation, true);
                        }
                    }).catch(() => { });
            } else {
                setPermissionGranted(true);
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        }

        return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }, []);

    const needleAngle = qiblaAngle !== null ? qiblaAngle - deviceHeading : 0;

    const accuracyColor = { good: '#2D6A4F', moderate: '#D4A843', poor: '#ef4444', unknown: 'var(--text-secondary)' };
    const accuracyLabel = { good: '✓ Good', moderate: '~ Moderate', poor: '✗ Poor', unknown: 'Calibrating...' };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg-primary)',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeIn 0.3s',
        }}>
            {/* Header */}
            <div style={{
                width: '100%',
                maxWidth: '480px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <button onClick={onBack} style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--bg-glass-border)',
                    borderRadius: '50%',
                    width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-primary)',
                }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Qibla Compass</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Direction to the Kaaba</div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '24px', width: '100%', maxWidth: '480px' }}>
                {error ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Location Required</div>
                        <div style={{ fontSize: '14px' }}>{error}</div>
                    </div>
                ) : (
                    <>
                        {/* Compass */}
                        <div style={{
                            width: '260px', height: '260px',
                            position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {/* Outer ring */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                borderRadius: '50%',
                                background: 'var(--bg-glass)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '2px solid var(--bg-glass-border)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            }} />

                            {/* Cardinal directions */}
                            {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([dir, angle]) => (
                                <div key={dir} style={{
                                    position: 'absolute',
                                    width: '100%', height: '100%',
                                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                                    transform: `rotate(${angle}deg)`,
                                    paddingTop: '12px',
                                }}>
                                    <span style={{
                                        fontSize: '13px', fontWeight: '700',
                                        color: dir === 'N' ? '#ef4444' : 'var(--text-secondary)',
                                        transform: `rotate(-${angle}deg)`,
                                    }}>{dir}</span>
                                </div>
                            ))}

                            {/* Needle */}
                            <div style={{
                                position: 'absolute',
                                width: '4px',
                                height: '100px',
                                transform: `rotate(${needleAngle}deg)`,
                                transformOrigin: 'bottom center',
                                bottom: '50%',
                                left: 'calc(50% - 2px)',
                                transition: 'transform 0.3s ease',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                            }}>
                                {/* Kaaba icon at tip */}
                                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🕋</div>
                                <div style={{
                                    flex: 1,
                                    width: '3px',
                                    background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-gold))',
                                    borderRadius: '2px',
                                }} />
                            </div>

                            {/* Center dot */}
                            <div style={{
                                width: '16px', height: '16px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                boxShadow: '0 0 12px rgba(45,106,79,0.5)',
                                zIndex: 1,
                            }} />
                        </div>

                        {/* Info */}
                        <div style={{ textAlign: 'center' }}>
                            {qiblaAngle !== null ? (
                                <>
                                    <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent-primary)', fontFamily: 'var(--font-family-counter)', lineHeight: 1 }}>
                                        {Math.round(qiblaAngle)}°
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Qibla Direction</div>
                                </>
                            ) : (
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Getting location...</div>
                            )}
                        </div>

                        {/* Accuracy */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '20px',
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accuracyColor[accuracy] }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Compass: <span style={{ color: accuracyColor[accuracy], fontWeight: '600' }}>{accuracyLabel[accuracy]}</span>
                            </span>
                        </div>

                        {location && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default QiblaCompass;
