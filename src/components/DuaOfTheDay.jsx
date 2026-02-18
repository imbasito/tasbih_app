import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getTodaysDua } from '../data/duas';

const DuaOfTheDay = ({ onDismiss }) => {
    const dua = getTodaysDua();
    const [isClosing, setIsClosing] = useState(false);

    const handleDismiss = () => {
        setIsClosing(true);
        setTimeout(onDismiss, 250);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: isClosing ? 'fadeOut 0.25s forwards' : 'fadeIn 0.3s',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '380px',
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--bg-glass-border)',
                borderRadius: '24px',
                padding: '28px 24px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                animation: isClosing ? 'scaleOut 0.25s forwards' : 'scaleIn 0.3s cubic-bezier(0.32,0.72,0,1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🤲</span>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Dua of the Day</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Daily supplication</div>
                        </div>
                    </div>
                    <button onClick={handleDismiss} style={{
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--bg-glass-border)',
                        borderRadius: '50%',
                        width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-secondary)',
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--bg-glass-border)' }} />

                {/* Arabic Text */}
                <div style={{
                    fontFamily: 'var(--font-family-arabic)',
                    fontSize: '22px',
                    lineHeight: '2',
                    textAlign: 'right',
                    direction: 'rtl',
                    color: 'var(--text-primary)',
                    maxHeight: '160px',
                    overflowY: 'auto',
                }}>
                    {dua.arabic}
                </div>

                {/* Translation */}
                <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    maxHeight: '100px',
                    overflowY: 'auto',
                }}>
                    "{dua.translation}"
                </div>

                {/* Source */}
                <div style={{
                    fontSize: '12px',
                    color: 'var(--accent-primary)',
                    fontWeight: '600',
                    padding: '6px 12px',
                    background: 'var(--accent-light)',
                    borderRadius: '20px',
                    alignSelf: 'flex-start',
                }}>
                    — {dua.source}
                </div>

                {/* Dismiss Button */}
                <button onClick={handleDismiss} style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s',
                }}>
                    ✕ Dismiss
                </button>
            </div>
        </div>
    );
};

export default DuaOfTheDay;
