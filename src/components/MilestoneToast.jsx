import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const MilestoneToast = ({ milestone, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (milestone) {
            setVisible(true);
            const t = setTimeout(() => {
                setVisible(false);
                setTimeout(onDismiss, 400);
            }, 5000);
            return () => clearTimeout(t);
        }
    }, [milestone]);

    if (!milestone) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: `translateX(-50%) translateY(${visible ? '0' : '-120px'})`,
            zIndex: 99999,
            width: 'calc(100% - 32px)',
            maxWidth: '440px',
            transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1)',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(45,106,79,0.15))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 8px 32px rgba(212,168,67,0.2)',
            }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{milestone.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: 'var(--accent-gold)',
                        marginBottom: '2px',
                    }}>
                        🎉 {milestone.label} — {milestone.threshold.toLocaleString()} dhikr!
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {milestone.quote}
                    </div>
                </div>
                <button onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                    <X size={16} color="var(--text-secondary)" />
                </button>
            </div>
        </div>
    );
};

export default MilestoneToast;
