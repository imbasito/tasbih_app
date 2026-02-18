import React, { useState } from 'react';
import {
    Sun, Moon, Monitor, Bell, BellOff, BookOpen, Database,
    Download, Upload, Trash2, Info, Coffee, CreditCard,
    Smartphone, ChevronDown, ChevronRight, Compass, Wind,
    Heart, X, Check, Copy
} from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';
import { useSettings } from '../context/SettingsContext';

const Section = ({ title, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>
            {title}
        </div>
        <div style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--bg-glass-border)',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            {children}
        </div>
    </div>
);

const SettingRow = ({ icon, iconBg, label, subtitle, right, onClick, divider = true }) => (
    <div onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: divider ? '1px solid var(--bg-glass-border)' : 'none',
        transition: 'background 0.15s',
    }}
        onMouseEnter={e => onClick && (e.currentTarget.style.background = 'var(--bg-glass)')}
        onMouseLeave={e => onClick && (e.currentTarget.style.background = 'transparent')}
    >
        <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: iconBg || 'var(--bg-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</div>
            {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>{subtitle}</div>}
        </div>
        {right}
    </div>
);

const Toggle = ({ value, onChange, label }) => (

    <div
        role="switch"
        aria-checked={!!value}
        aria-label={label}
        tabIndex={0}
        onClick={() => onChange(!value)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!value)}
        style={{
            width: '44px', height: '26px',
            borderRadius: '13px',
            background: value ? 'var(--accent-primary)' : 'var(--bg-glass-border)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.25s',
            flexShrink: 0,
        }}>
        <div style={{
            position: 'absolute',
            top: '3px',
            left: value ? '21px' : '3px',
            width: '20px', height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.25s cubic-bezier(0.32,0.72,0,1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
    </div>
);

const SettingsView = ({ onOpenQibla }) => {
    const { settings, updateSetting, isDark, toggleTheme } = useSettings();
    const [statusMsg, setStatusMsg] = useState('');
    const [copiedText, setCopiedText] = useState(null);
    const [showDonation, setShowDonation] = useState(null);
    const [showAboutModal, setShowAboutModal] = useState(false);

    const updateNotification = (prayer, value) => {
        updateSetting('notifications', {
            ...(settings.notifications || {}), [prayer]: value
        });
    };

    const notifications = settings.notifications || {};

    const handleBackup = async () => {
        setStatusMsg('Creating backup...');
        try {
            const data = JSON.stringify(localStorage);
            const fileName = `tasbih_backup_${Date.now()}.json`;
            if (Capacitor.isNativePlatform()) {
                const result = await Filesystem.writeFile({ path: fileName, data, directory: Directory.Documents, encoding: Encoding.UTF8 });
                await Share.share({ title: 'Tasbih Backup', url: result.uri });
                setStatusMsg('Backup shared!');
            } else {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = fileName;
                document.body.appendChild(a); a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
                setStatusMsg('Download started!');
            }
        } catch (e) { setStatusMsg('Error: ' + e.message); }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (window.confirm('Restore data? Current data will be replaced.')) {
                    localStorage.clear();
                    Object.keys(parsed).forEach(k => localStorage.setItem(k, parsed[k]));
                    window.location.reload();
                }
            } catch { alert('Invalid backup file'); }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.confirm('Clear ALL data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleCopy = async (text) => {
        try { await Clipboard.write({ string: text }); } catch { navigator.clipboard?.writeText(text); }
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerLabels = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Settings</h2>

            {statusMsg && (
                <div style={{ padding: '10px 14px', background: 'var(--accent-light)', borderRadius: '10px', fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    {statusMsg}
                </div>
            )}

            {/* Appearance */}
            <Section title="Appearance">
                <SettingRow
                    icon={isDark ? <Moon size={18} color="#fff" /> : <Sun size={18} color="#fff" />}
                    iconBg={isDark ? '#1a1a2e' : '#f59e0b'}
                    label="Theme"
                    subtitle={isDark ? 'Dark mode' : 'Light mode'}
                    right={
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['light', 'dark'].map(t => (
                                <button key={t} onClick={() => toggleTheme(t)} style={{

                                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                                    background: (isDark ? 'dark' : 'light') === t ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                    color: (isDark ? 'dark' : 'light') === t ? '#fff' : 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    }
                    divider={false}
                />
            </Section>

            {/* Counter */}
            <Section title="Counter">
                <SettingRow
                    icon={<span style={{ fontSize: '18px' }}>📳</span>}
                    iconBg="var(--accent-light)"
                    label="Haptic Feedback"
                    subtitle="Vibrate on each count"
                    right={<Toggle value={settings.haptic !== false} onChange={v => updateSetting('haptic', v)} />}
                />
                <SettingRow
                    icon={<Wind size={18} color="var(--accent-teal)" />}
                    iconBg="rgba(13,148,136,0.1)"
                    label="Breathing Mode"
                    subtitle="Pulsing circle for mindful counting"
                    right={<Toggle value={!!settings.breathingMode} onChange={v => updateSetting('breathingMode', v)} />}
                    divider={false}
                />
            </Section>

            {/* Dua of the Day */}
            <Section title="Dua of the Day">
                <SettingRow
                    icon={<span style={{ fontSize: '18px' }}>🤲</span>}
                    iconBg="rgba(212,168,67,0.15)"
                    label="Show on Launch"
                    subtitle="Display dua popup when app opens"
                    right={<Toggle value={settings.duaOnLaunch !== false} onChange={v => updateSetting('duaOnLaunch', v)} />}
                />
                <SettingRow
                    icon={<Bell size={18} color="var(--accent-gold)" />}
                    iconBg="rgba(212,168,67,0.15)"
                    label="Morning Notification"
                    subtitle="Send dua after Fajr prayer"
                    right={<Toggle value={!!settings.duaNotification} onChange={v => updateSetting('duaNotification', v)} />}
                    divider={false}
                />
            </Section>

            {/* Prayer Notifications */}
            <Section title="Prayer Notifications">
                {prayers.map((prayer, i) => (
                    <SettingRow
                        key={prayer}
                        icon={<Bell size={18} color={notifications[prayer] !== false ? 'var(--accent-primary)' : 'var(--text-secondary)'} />}
                        iconBg={notifications[prayer] !== false ? 'var(--accent-light)' : 'var(--bg-glass)'}
                        label={prayerLabels[prayer]}
                        subtitle="Remind me to recite adhkar"
                        right={<Toggle value={notifications[prayer] !== false} onChange={v => updateNotification(prayer, v)} />}
                        divider={i < prayers.length - 1}
                    />
                ))}
            </Section>

            {/* Ramadan Mode */}
            <Section title="Ramadan Mode">
                <SettingRow
                    icon={<span style={{ fontSize: '18px' }}>🌙</span>}
                    iconBg="rgba(212,168,67,0.15)"
                    label="Ramadan Mode"
                    subtitle="Suhoor/Iftar countdown + extra adhkar"
                    right={<Toggle value={!!settings.ramadanMode} onChange={v => updateSetting('ramadanMode', v)} />}
                    divider={false}
                />
            </Section>

            {/* Tools */}
            <Section title="Tools">
                <SettingRow
                    icon={<Compass size={18} color="#fff" />}
                    iconBg="var(--accent-primary)"
                    label="Qibla Compass"
                    subtitle="Find the direction of prayer"
                    right={<ChevronRight size={18} color="var(--text-secondary)" />}
                    onClick={onOpenQibla}
                />
                <SettingRow
                    icon={<Download size={18} color="var(--accent-primary)" />}
                    iconBg="var(--accent-light)"
                    label="Backup Data"
                    subtitle="Save your adhkar & progress"
                    right={<ChevronRight size={18} color="var(--text-secondary)" />}
                    onClick={handleBackup}
                />
                <label style={{ display: 'block' }}>
                    <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
                    <SettingRow
                        icon={<Upload size={18} color="var(--text-secondary)" />}
                        iconBg="var(--bg-glass)"
                        label="Restore Backup"
                        subtitle="Load from a backup file"
                        right={<ChevronRight size={18} color="var(--text-secondary)" />}
                        onClick={null}
                        divider={false}
                    />
                </label>
            </Section>

            {/* About & Legal */}
            <Section title="About">
                {/* Privacy Policy */}
                <SettingRow
                    icon={<span style={{ fontSize: '18px' }}>🔒</span>}
                    iconBg="rgba(99,102,241,0.15)"
                    label="Privacy Policy"
                    subtitle="How we handle your data"
                    right={<ChevronRight size={18} color="var(--text-secondary)" />}
                    onClick={() => window.open('https://imbasito.github.io/tasbih-privacy/', '_blank')}
                />
                {/* About button — opens modal */}
                <SettingRow
                    icon={<Info size={18} color="#fff" />}
                    iconBg="var(--accent-primary)"
                    label="About"
                    subtitle="Developer info & support"
                    right={<ChevronRight size={18} color="var(--text-secondary)" />}
                    onClick={() => setShowAboutModal(true)}
                    divider={false}
                />
            </Section>

            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', paddingBottom: '8px' }}>
                Tasbih App v1.0 · Made with 💚 for the Ummah
            </div>


            {/* ── About Modal ── */}
            {showAboutModal && (
                <div

                    onClick={() => { setShowAboutModal(false); setShowDonation(null); }}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        padding: '0 0 24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'var(--blur-glass)',
                            WebkitBackdropFilter: 'var(--blur-glass)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '28px',
                            padding: '24px',
                            width: 'calc(100% - 32px)',
                            maxWidth: '448px',
                            boxShadow: 'var(--shadow-glass-modal)',
                            animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
                            display: 'flex', flexDirection: 'column', gap: '14px',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>About</div>
                            <button
                                onClick={() => { setShowAboutModal(false); setShowDonation(null); }}
                                style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Developer card */}
                        <button
                            onClick={() => window.open('https://www.linkedin.com/in/imbasito/', '_blank')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '14px', borderRadius: '16px',
                                background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
                                boxShadow: 'var(--shadow-glass)',
                            }}
                        >
                            <span style={{ fontSize: '28px' }}>👨‍💻</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Made by imbasito</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>linkedin.com/in/imbasito</div>
                            </div>
                            <ChevronRight size={16} color="var(--text-secondary)" />
                        </button>

                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Support the Developer 💚
                        </div>

                        {/* Easypaisa */}
                        <div style={{ borderRadius: '16px', border: '1px solid var(--bg-glass-border)', overflow: 'hidden', boxShadow: 'var(--shadow-glass)' }}>
                            <button
                                onClick={() => setShowDonation(showDonation === 'ep' ? null : 'ep')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px 16px', width: '100%',
                                    background: 'var(--bg-glass)', border: 'none',
                                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#37B658', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Smartphone size={18} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Easypaisa</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Support via mobile wallet</div>
                                </div>
                                <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: showDonation === 'ep' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {showDonation === 'ep' && (
                                <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--bg-glass-border)', animation: 'fadeIn 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: '10px', marginTop: '12px' }}>
                                        <code style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>PK80TMFB0000000023842370</code>
                                        <button onClick={() => handleCopy('PK80TMFB0000000023842370')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: '4px' }}>
                                            {copiedText === 'PK80TMFB0000000023842370' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bank Transfer */}
                        <div style={{ borderRadius: '16px', border: '1px solid var(--bg-glass-border)', overflow: 'hidden', boxShadow: 'var(--shadow-glass)' }}>
                            <button
                                onClick={() => setShowDonation(showDonation === 'bank' ? null : 'bank')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px 16px', width: '100%',
                                    background: 'var(--bg-glass)', border: 'none',
                                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CreditCard size={18} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Bank Transfer (UBL)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Support via bank account</div>
                                </div>
                                <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: showDonation === 'bank' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {showDonation === 'bank' && (
                                <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--bg-glass-border)', animation: 'fadeIn 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: '10px', marginTop: '12px' }}>
                                        <code style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>PK41UNIL0109000271840611</code>
                                        <button onClick={() => handleCopy('PK41UNIL0109000271840611')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: '4px' }}>
                                            {copiedText === 'PK41UNIL0109000271840611' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '4px' }}>
                            Tasbih App v1.0 · Made with 💚 for the Ummah
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default SettingsView;
