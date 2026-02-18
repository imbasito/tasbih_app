// ─── localStorage Keys ───────────────────────────────────────────────────────
// Centralised here to prevent typos across the codebase.

export const KEYS = {
    THEME_DARK: 'tasbih_theme_dark',
    SETTINGS: 'tasbih_settings',
    ADHKAR_DATA: 'tasbih_adhkar_data',
    ACTIVE_DHIKR: 'tasbih_last_active_dhikr',
    DUA_LAST_SHOWN: 'tasbih_dua_last_shown',

    // Stats
    LIFETIME_COUNT: 'tasbih_lifetime_count',
    MILESTONES: 'tasbih_milestones_reached',
    DAILY_STATS: 'tasbih_daily_stats',
    STREAK: 'tasbih_streak',

    // Per-dhikr count (appended with dhikr id)
    COUNT_PREFIX: 'tasbih_count_',
};
