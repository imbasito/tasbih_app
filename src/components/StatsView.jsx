import React from 'react';
import { MILESTONES } from '../data/milestones';

const StatsView = ({ lifetimeCount, todayCount, streak, milestonesReached, categoryBreakdown, dailyStats }) => {
    const maxCatCount = Math.max(...Object.values(categoryBreakdown || {}), 1);

    const formatCategory = (cat) => cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const CATEGORY_EMOJIS = {
        morning: '☀️', evening: '🌙', 'after-prayer': '🕌', quran: '📖', general: '💚',
    };

    const dailyGoal = 100;
    const goalProgress = Math.min(todayCount / dailyGoal, 1);

    // Weekly chart: last 7 days
    const today = new Date();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
            count: dailyStats?.[key] || 0,
            isToday: i === 6,
        };
    });
    const maxWeekCount = Math.max(...weekDays.map(d => d.count), 1);

    const glassCard = {
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--bg-glass-border)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: 'var(--shadow-glass)',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Statistics</h2>

            {/* Lifetime Count Hero */}
            <div style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '20px',
                padding: '22px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--nav-active-glow)',
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Lifetime Dhikr
                </div>
                <div style={{ fontSize: '52px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-family-counter)', lineHeight: 1 }}>
                    {lifetimeCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
                    سُبْحَانَ اللَّهِ
                </div>
            </div>

            {/* Today + Streak Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Today */}
                <div style={glassCard}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Today</div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-family-counter)', lineHeight: 1 }}>{todayCount}</div>
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Goal</span>
                            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700' }}>{Math.round(goalProgress * 100)}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${goalProgress * 100}%`,
                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '2px',
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>of {dailyGoal}</div>
                    </div>
                </div>

                {/* Streak */}
                <div style={glassCard}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Streak 🔥</div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--accent-gold)', fontFamily: 'var(--font-family-counter)', lineHeight: 1 }}>{streak.current}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>days</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Best: <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{streak.best}d</span>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Chart */}
            <div style={glassCard}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>This Week</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
                    {weekDays.map((day, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{
                                width: '100%',
                                height: `${Math.max((day.count / maxWeekCount) * 48, day.count > 0 ? 4 : 2)}px`,
                                background: day.isToday
                                    ? 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))'
                                    : day.count > 0
                                        ? 'var(--accent-light)'
                                        : 'var(--bg-glass-border)',
                                borderRadius: '4px 4px 2px 2px',
                                transition: 'height 0.4s ease',
                                border: day.isToday ? '1px solid var(--accent-primary)' : 'none',
                            }} />
                            <div style={{ fontSize: '10px', color: day.isToday ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: day.isToday ? '700' : '500' }}>
                                {day.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryBreakdown || {}).length > 0 && (
                <div style={glassCard}>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>By Category</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([cat, count]) => (
                            <div key={cat}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                        {CATEGORY_EMOJIS[cat] || '📿'} {formatCategory(cat)}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>{count.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '5px', background: 'var(--bg-glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(count / maxCatCount) * 100}%`,
                                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                        borderRadius: '3px',
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Milestones — horizontal scroll carousel */}
            <div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>Milestones</div>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    {MILESTONES.map((m) => {
                        const unlocked = milestonesReached.includes(m.threshold) || lifetimeCount >= m.threshold;
                        return (
                            <div key={m.threshold} style={{
                                flexShrink: 0,
                                width: '100px',
                                ...glassCard,
                                padding: '14px 10px',
                                textAlign: 'center',
                                opacity: unlocked ? 1 : 0.45,
                                transition: 'opacity 0.3s',
                                border: unlocked ? '1px solid var(--accent-gold)' : '1px solid var(--bg-glass-border)',
                                boxShadow: unlocked ? '0 0 12px rgba(212,168,67,0.2)' : 'var(--shadow-glass)',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '50%',
                                    background: unlocked ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-primary))' : 'var(--bg-glass-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px',
                                    margin: '0 auto 8px',
                                    boxShadow: unlocked ? '0 4px 12px rgba(212,168,67,0.3)' : 'none',
                                }}>
                                    {unlocked ? m.icon : '🔒'}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: '2px', lineHeight: 1.2 }}>
                                    {m.label}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                    {m.threshold >= 1000 ? `${m.threshold / 1000}k` : m.threshold}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatsView;
