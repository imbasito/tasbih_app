import React from 'react';
import { CircleDot, BookOpen, TrendingUp, Settings, Moon } from 'lucide-react';

// Custom Sajda SVG icon (person in prostration silhouette)
const SajdaIcon = ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <circle cx="18" cy="4.5" r="1.8" fill={color} stroke="none" />
        {/* Body bowing down */}
        <path d="M18 6.3 L14 10 L6 10" />
        {/* Arms on ground */}
        <path d="M6 10 L3 12" />
        {/* Legs */}
        <path d="M14 10 L13 14 L10 16" />
        {/* Forehead on ground */}
        <path d="M3 12 L5 13" />
    </svg>
);

const NAV_ITEMS = [
    { id: 'counter', Icon: CircleDot, label: 'Counter', subtitle: 'Counter' },
    { id: 'adhkar', Icon: BookOpen, label: 'Adhkar', subtitle: 'Adhkar' },
    { id: 'prayer', Icon: SajdaIcon, label: 'Prayer', subtitle: 'Prayers' },
    { id: 'stats', Icon: TrendingUp, label: 'Stats', subtitle: 'Stats' },
    { id: 'settings', Icon: Settings, label: 'Settings', subtitle: 'Settings' },
];

const BottomNav = ({ currentView, onViewChange }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 16px 20px',
            background: 'linear-gradient(to top, var(--bg-primary) 55%, transparent)',
            pointerEvents: 'none',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                border: '1px solid var(--bg-glass-border)',
                borderRadius: '32px',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-glass-raised)',
                pointerEvents: 'all',
            }}>
                {NAV_ITEMS.map(({ id, Icon, label, subtitle }) => {
                    const isActive = currentView === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onViewChange(id)}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                            style={{
                                minWidth: '56px',
                                height: '52px',
                                borderRadius: '24px',
                                border: 'none',
                                background: isActive
                                    ? 'var(--accent-primary)'
                                    : 'transparent',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                padding: '0 10px',
                                transition: 'all 0.25s cubic-bezier(0.32,0.72,0,1)',
                                boxShadow: isActive ? 'var(--nav-active-glow)' : 'none',
                                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                            }}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? '#fff' : 'var(--text-secondary)'} />
                            <span style={{
                                fontSize: '9px',
                                fontWeight: isActive ? '700' : '500',
                                letterSpacing: '0.02em',
                                lineHeight: 1,
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                            }}>
                                {subtitle}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
