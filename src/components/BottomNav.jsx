import React from 'react';
import { Circle, List, Settings } from 'lucide-react';

const BottomNav = ({ currentView, onViewChange }) => {
    const navItems = [
        { id: 'counter', icon: Circle },
        { id: 'adhkar', icon: List },
        { id: 'settings', icon: Settings },
    ];

    return (
        <div style={{
            padding: '8px 16px 12px 16px',
            display: 'flex',
            justifyContent: 'center',
            position: 'sticky',
            bottom: 0,
            zIndex: 100,
        }}>
            <div className="glass-strong" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px',
                borderRadius: 'var(--radius-pill)',
                width: 'auto',
            }}>
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            style={{
                                background: isActive ? 'var(--accent-primary)' : 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '12px 20px',
                                borderRadius: 'var(--radius-pill)',
                                boxShadow: isActive ? 'var(--nav-active-glow)' : 'none',
                                transition: 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                                transform: isActive ? 'scale(1)' : 'scale(0.95)',
                                outline: 'none',
                                WebkitTapHighlightColor: 'transparent',
                            }}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                fill={item.id === 'counter' && isActive ? '#fff' : 'none'}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
