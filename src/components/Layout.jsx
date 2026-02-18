import React from 'react';

const Layout = ({ children, isDark }) => {
    return (
        <div
            data-theme={isDark ? 'dark' : 'light'}
            style={{
                minHeight: '100dvh',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family-ui)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflowX: 'hidden',
            }}
        >
            {/* Subtle background gradient orbs */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-20%',
                    width: '60vw', height: '60vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', left: '-15%',
                    width: '50vw', height: '50vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)',
                }} />
            </div>

            {/* Main content */}
            <main style={{
                flex: 1,
                position: 'relative', zIndex: 1,
                padding: '16px 16px 96px',
                maxWidth: '480px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {children}
            </main>

        </div>
    );
};

export default Layout;
