import React from 'react';
import { Check } from 'lucide-react';
import { CATEGORY_META } from '../../data/adhkar';

const AameenOverlay = ({ category, particles, onReset, onDone }) => (
    <div
        role="dialog"
        aria-modal="true"
        aria-label="Dhikr complete — Aameen"
        style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 8000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '24px', animation: 'fadeIn 0.4s',
        }}
    >
        {/* Gold particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map(i => (
                <div key={i} style={{
                    position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    left: `${10 + (i * 7.5)}%`, top: `${20 + (i % 3) * 20}%`,
                    animation: `particleFly ${1.5 + (i % 3) * 0.5}s ease-out ${i * 0.1}s infinite`,
                    opacity: 0.7,
                }} />
            ))}
        </div>

        <div style={{ fontSize: '24px', letterSpacing: '8px', animation: 'pulseGold 2s ease-in-out infinite' }}>
            ✦ ✦ ✦ ✦ ✦
        </div>

        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontFamily: 'var(--font-family-arabic)', fontSize: '72px',
                color: 'var(--accent-gold)', lineHeight: 1.2,
                animation: 'scaleIn 0.5s cubic-bezier(0.32,0.72,0,1)',
            }}>
                آمين
            </div>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: '600' }}>
                Aameen
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                {CATEGORY_META[category]?.label || category} Complete ✓
            </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
            <button
                onClick={onReset}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
                    color: '#fff', fontSize: '15px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                ↺ Restart
            </button>
            <button
                onClick={onDone}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px',
                    background: 'var(--accent-primary)', border: 'none', borderRadius: '16px',
                    color: '#fff', fontSize: '15px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 8px 24px rgba(45,106,79,0.4)',
                }}
            >
                <Check size={18} /> Done
            </button>
        </div>
    </div>
);

export default AameenOverlay;
