import React from 'react';

const ProgressRing = ({ count, target, progress, breathingScale, breathingMode, showAameen, onTap }) => {
    // Dynamic sizing: fills available space, capped at 320px
    const SIZE = 'min(80vw, 360px)';
    const RADIUS_RATIO = 0.44; // radius as fraction of size

    const strokeDash = `calc(2 * 3.14159 * ${RADIUS_RATIO} * min(80vw, 360px))`;

    // We use a fixed SVG viewBox and let CSS scale it
    const svgR = 126; // 126 + 4 (half stroke) = 130 (matches viewbox radius)
    const svgSize = 260;
    const circumference = 2 * Math.PI * svgR;
    const strokeOffset = circumference * (1 - Math.min(progress, 1));

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            padding: '4px 0',
        }}>
            <button
                onClick={onTap}
                aria-label={`Count: ${count} of ${target}. Tap to increment.`}
                aria-disabled={showAameen}
                style={{
                    position: 'relative',
                    width: 'min(80vw, 360px)',
                    height: 'min(80vw, 360px)',
                    cursor: showAameen ? 'default' : 'pointer',
                    userSelect: 'none',
                    transform: `scale(${breathingScale})`,
                    transition: `transform ${breathingMode ? '4s' : '0.12s'} ${breathingMode ? 'ease-in-out' : 'cubic-bezier(0.32,0.72,0,1)'}`,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    borderRadius: '50%',
                }}
                onMouseDown={e => !breathingMode && (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => !breathingMode && (e.currentTarget.style.transform = `scale(${breathingScale})`)}
                onTouchStart={e => !breathingMode && (e.currentTarget.style.transform = 'scale(0.96)')}
                onTouchEnd={e => !breathingMode && (e.currentTarget.style.transform = `scale(${breathingScale})`)}
            >
                {/* SVG Progress Ring — fills button */}
                <svg
                    viewBox={`0 0 ${svgSize} ${svgSize}`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                >
                    {/* Track - darker for visibility */}
                    <circle
                        cx={svgSize / 2} cy={svgSize / 2} r={svgR}
                        fill="none"
                        stroke="var(--text-primary)"
                        strokeOpacity="0.15"
                        strokeWidth="8"
                    />
                    {/* Progress */}
                    <circle
                        cx={svgSize / 2} cy={svgSize / 2} r={svgR}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                </svg>

                {/* Glass inner circle */}
                <div style={{
                    position: 'absolute',
                    inset: '18px',
                    borderRadius: '50%',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'var(--blur-glass)',
                    WebkitBackdropFilter: 'var(--blur-glass)',
                    border: '1px solid var(--bg-glass-border)',
                    boxShadow: 'var(--shadow-glass-raised), 0 0 0 1px var(--bg-glass-highlight) inset',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        fontSize: 'clamp(52px, 14vw, 80px)',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-family-counter)',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                    }}>
                        {count}
                    </div>
                    <div style={{
                        fontSize: 'clamp(12px, 3vw, 16px)',
                        color: 'var(--text-secondary)',
                        marginTop: '6px',
                        fontWeight: '500',
                    }}>
                        / {target}
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ProgressRing;
