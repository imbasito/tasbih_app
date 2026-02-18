import React from 'react';
import { Home, List } from 'lucide-react';

const BottomNav = ({ currentView, onViewChange }) => {
    // Removed Prayers tab as requested
    const navItems = [
        { id: 'counter', icon: Home, label: 'Tasbih' },
        { id: 'adhkar', icon: List, label: 'Adhkar' }
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px 20px', // Increased padding for bigger touch targets
            backgroundColor: 'var(--neutral-layer-1)',
            borderBottom: '1px solid var(--neutral-layer-2)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 8px rgba(0,0,0,0.02)' // slightly stronger shadow
        }}>
            <div style={{
                display: 'flex',
                backgroundColor: 'var(--neutral-layer-2)',
                borderRadius: '12px', // Bigger radius
                padding: '4px',
                width: '100%'
            }}>
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            style={{
                                background: isActive ? 'var(--neutral-layer-card)' : 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px', // Increased gap
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '10px 16px', // Bigger padding
                                flex: 1,
                                borderRadius: '8px', // Bigger radius
                                fontSize: '15px', // Bigger font
                                fontWeight: isActive ? '600' : '500',
                                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.2s cubic-bezier(0.33, 1, 0.68, 1)' // Fluent easing
                            }}
                        >
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
