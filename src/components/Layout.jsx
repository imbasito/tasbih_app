import React, { useEffect, useState } from 'react';
import { Sun, Moon, Database, Download, Upload, X, Info, Coffee, CreditCard, Copy, Check, Smartphone, ChevronDown } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';

const Layout = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showCoffeeModal, setShowCoffeeModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const [donationType, setDonationType] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const performBackup = async () => {
        setStatusMsg('Generating backup...');
        try {
            const data = JSON.stringify(localStorage);
            const fileName = `tasbih_backup_${Date.now()}.json`;

            if (Capacitor.isNativePlatform()) {
                try {
                    const result = await Filesystem.writeFile({
                        path: fileName,
                        data: data,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8
                    });
                    setStatusMsg('File saved. Opening share...');
                    await Share.share({
                        title: 'Tasbih Backup',
                        text: 'Tasbih App Data',
                        url: result.uri,
                        dialogTitle: 'Save Backup'
                    });
                    setStatusMsg('Backup complete!');
                } catch (err) {
                    console.error('Native file error:', err);
                    await Clipboard.write({ string: data });
                    setStatusMsg('File error. Data copied to Clipboard!');
                }
            } else {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setStatusMsg('Download started!');
                }, 100);
            }
        } catch (e) {
            console.error(e);
            setStatusMsg('Error: ' + e.message);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (window.confirm('Restore data? Current data will be replaced.')) {
                    localStorage.clear();
                    Object.keys(parsed).forEach(k => localStorage.setItem(k, parsed[k]));
                    alert('Restored! Reloading...');
                    window.location.reload();
                }
            } catch (err) {
                alert('Invalid File');
            }
        };
        reader.readAsText(file);
        setShowBackupModal(false);
    };

    const handleCopy = async (text) => {
        await Clipboard.write({ string: text });
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Minimal Header */}
                <header style={{
                    padding: '12px 16px 8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    zIndex: 10,
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            lineHeight: 1,
                            letterSpacing: '-0.03em',
                            fontFamily: 'var(--font-family-base)',
                        }}>
                            Tasbih
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => setShowCoffeeModal(true)}
                            className="glass"
                            style={{
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--bg-glass-border)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '8px',
                                borderRadius: 'var(--radius-s)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            title="Support"
                        >
                            <Coffee size={16} />
                        </button>

                        <button
                            onClick={() => setShowBackupModal(true)}
                            className="glass"
                            style={{
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--bg-glass-border)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '8px',
                                borderRadius: 'var(--radius-s)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            title="Backup & Restore"
                        >
                            <Database size={16} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="glass"
                            style={{
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--bg-glass-border)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '8px',
                                borderRadius: 'var(--radius-s)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>
                </header>

                <main style={{
                    flex: 1,
                    padding: '4px 16px 0 16px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: '0',
                }}>
                    {children}
                </main>

                {/* BACKUP MODAL */}
                {showBackupModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s',
                    }} onClick={() => setShowBackupModal(false)}>
                        <div className="glass-strong" style={{
                            width: '85%', maxWidth: '320px',
                            borderRadius: 'var(--radius-l)',
                            padding: '24px',
                            boxShadow: 'var(--elevation-16)',
                            display: 'flex', flexDirection: 'column', gap: '16px',
                            animation: 'scaleIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Data Management</h2>
                                <button onClick={() => setShowBackupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} color="var(--text-secondary)" />
                                </button>
                            </div>

                            {statusMsg && (
                                <div style={{
                                    padding: '8px',
                                    backgroundColor: 'var(--accent-light)',
                                    borderRadius: 'var(--radius-s)',
                                    fontSize: '13px',
                                    color: 'var(--accent-primary)',
                                    textAlign: 'center',
                                }}>
                                    {statusMsg}
                                </div>
                            )}

                            <button onClick={performBackup} className="glass" style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                                borderRadius: 'var(--radius-m)', cursor: 'pointer', textAlign: 'left',
                            }}>
                                <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: 'var(--radius-s)', color: 'var(--accent-primary)' }}>
                                    <Download size={20} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', fontSize: '15px' }}>Save Backup</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Save data to file</span>
                                </div>
                            </button>

                            <label className="glass" style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                                borderRadius: 'var(--radius-m)', cursor: 'pointer', textAlign: 'left', position: 'relative',
                            }}>
                                <input type="file" accept=".json" onChange={handleFileSelect} style={{
                                    position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer'
                                }} />
                                <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: 'var(--radius-s)', color: 'var(--text-primary)' }}>
                                    <Upload size={20} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', fontSize: '15px' }}>Restore Backup</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Load data from file</span>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* COFFEE / ABOUT MODAL */}
                {showCoffeeModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s',
                    }} onClick={() => { setShowCoffeeModal(false); setDonationType(null); }}>
                        <div className="glass-strong" style={{
                            width: '85%', maxWidth: '320px',
                            borderRadius: 'var(--radius-l)',
                            padding: '24px',
                            boxShadow: 'var(--elevation-16)',
                            display: 'flex', flexDirection: 'column', gap: '12px',
                            maxHeight: '80vh', overflowY: 'auto',
                            animation: 'scaleIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Support & About</h2>
                                <button onClick={() => { setShowCoffeeModal(false); setDonationType(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} color="var(--text-secondary)" />
                                </button>
                            </div>

                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Buy me a Coffee</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Easypaisa */}
                                <div className="glass" style={{ borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                                    <button
                                        onClick={() => setDonationType(donationType === 'easypaisa' ? null : 'easypaisa')}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                    >
                                        <div style={{ background: '#37B658', padding: '6px', borderRadius: 'var(--radius-s)', color: 'white' }}><Smartphone size={18} /></div>
                                        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>Easypaisa</span>
                                        <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: donationType === 'easypaisa' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>

                                    {donationType === 'easypaisa' && (
                                        <div style={{ padding: '0 14px 14px 14px', animation: 'fadeIn 0.2s' }}>
                                            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-s)' }}>
                                                <code style={{ flex: 1, fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-primary)' }}>PK80TMFB0000000023842370</code>
                                                <button onClick={() => handleCopy('PK80TMFB0000000023842370')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}>
                                                    {copiedText === 'PK80TMFB0000000023842370' ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bank */}
                                <div className="glass" style={{ borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                                    <button
                                        onClick={() => setDonationType(donationType === 'bank' ? null : 'bank')}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                    >
                                        <div style={{ background: 'var(--accent-primary)', padding: '6px', borderRadius: 'var(--radius-s)', color: 'white' }}><CreditCard size={18} /></div>
                                        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>Bank</span>
                                        <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: donationType === 'bank' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>

                                    {donationType === 'bank' && (
                                        <div style={{ padding: '0 14px 14px 14px', animation: 'fadeIn 0.2s' }}>
                                            <div className="glass" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', borderRadius: 'var(--radius-s)' }}>
                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>UBL</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <code style={{ flex: 1, fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-primary)' }}>PK41UNIL0109000271840611</code>
                                                    <button onClick={() => handleCopy('PK41UNIL0109000271840611')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}>
                                                        {copiedText === 'PK41UNIL0109000271840611' ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--bg-glass-border)', margin: '8px 0' }}></div>

                            <a href="https://www.linkedin.com/in/imbasito/" target="_blank" rel="noopener noreferrer" className="glass" style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                                borderRadius: 'var(--radius-m)', cursor: 'pointer', textAlign: 'left', textDecoration: 'none',
                            }}>
                                <div style={{ background: 'var(--bg-glass)', padding: '6px', borderRadius: 'var(--radius-s)', color: 'var(--text-primary)' }}><Info size={18} /></div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>About Developer</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View LinkedIn Profile</span>
                                </div>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;
