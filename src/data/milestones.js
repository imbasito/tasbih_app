// Lifetime Milestone Thresholds with Islamic Quotes
export const MILESTONES = [
    {
        threshold: 100,
        label: "First Steps",
        icon: "🌱",
        quote: "\"Whoever says SubhanAllah 100 times, a thousand good deeds are recorded for him.\" — Muslim",
    },
    {
        threshold: 500,
        label: "Growing",
        icon: "🌿",
        quote: "\"The best of deeds are those done regularly, even if they are few.\" — Bukhari & Muslim",
    },
    {
        threshold: 1000,
        label: "Dedicated",
        icon: "⭐",
        quote: "\"Verily, in the remembrance of Allah do hearts find rest.\" — Surah Ar-Ra'd 13:28",
    },
    {
        threshold: 5000,
        label: "Consistent",
        icon: "🌟",
        quote: "\"The most beloved of deeds to Allah are those that are most consistent, even if they are small.\" — Bukhari",
    },
    {
        threshold: 10000,
        label: "Devoted",
        icon: "💎",
        quote: "\"Remember Allah much, that you may be successful.\" — Surah Al-Jumu'ah 62:10",
    },
    {
        threshold: 33000,
        label: "SubhanAllah Master",
        icon: "🏆",
        quote: "\"Two words are light on the tongue, heavy in the scales, beloved to the Most Merciful: SubhanAllah wa bihamdihi, SubhanAllah al-Azeem.\" — Bukhari",
    },
    {
        threshold: 50000,
        label: "Unwavering",
        icon: "🌙",
        quote: "\"And the men and women who remember Allah frequently — Allah has prepared for them forgiveness and a great reward.\" — Surah Al-Ahzab 33:35",
    },
    {
        threshold: 100000,
        label: "A Lifetime of Dhikr",
        icon: "✨",
        quote: "\"Those who believe and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest.\" — Surah Ar-Ra'd 13:28",
    },
];

// Get next uncelebrated milestone
export const getNextMilestone = (lifetimeCount, reached) => {
    return MILESTONES.find(m => m.threshold > lifetimeCount && !reached.includes(m.threshold));
};

// Get all unlocked milestones
export const getUnlockedMilestones = (lifetimeCount) => {
    return MILESTONES.filter(m => m.threshold <= lifetimeCount);
};
