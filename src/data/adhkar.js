// Central Adhkar Data Store
export const INITIAL_ADHKAR_DATA = {
    morning: [
        { id: 101, text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", count: 1, translation: "Ayat al-Kursi — Allah! There is no god but He, the Living, the Self-subsisting." },
        { id: 102, text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", count: 3, translation: "Surah Al-Ikhlas — Say: He is Allah, the One..." },
        { id: 103, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ", count: 3, translation: "Surah Al-Falaq — Say: I seek refuge in the Lord of the daybreak..." },
        { id: 104, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ", count: 3, translation: "Surah An-Nas — Say: I seek refuge in the Lord of mankind..." },
        { id: 105, text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", count: 1, translation: "Sayyidul Istighfar — O Allah, You are my Lord, none has the right to be worshipped except You..." },
        { id: 106, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", count: 3, translation: "Glory is to Allah and praise is to Him, by the number of His creation, His pleasure, the weight of His throne, and the ink of His words." },
        { id: 107, text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1, translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live and by You we die, and to You is the resurrection." },
        { id: 108, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, translation: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent." },
        { id: 109, text: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ", count: 7, translation: "O Allah, protect me from the Fire. (Recited 7 times after Fajr)" },
        { id: 110, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, translation: "Glory is to Allah and praise is to Him. (100 times)" },
    ],
    evening: [
        { id: 201, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", count: 1, translation: "Ayat al-Kursi" },
        { id: 202, text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", count: 3, translation: "Surah Al-Ikhlas" },
        { id: 203, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ", count: 3, translation: "Surah Al-Falaq" },
        { id: 204, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ", count: 3, translation: "Surah An-Nas" },
        { id: 205, text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ", count: 1, translation: "Sayyidul Istighfar" },
        { id: 206, text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, translation: "I seek refuge in the perfect words of Allah from the evil of what He has created." },
        { id: 207, text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", count: 1, translation: "O Allah, by You we enter the evening, by You we enter the morning, by You we live and by You we die, and to You is the final return." },
        { id: 208, text: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ", count: 7, translation: "O Allah, protect me from the Fire. (Recited 7 times after Maghrib)" },
    ],
    "after-prayer": [
        { id: 301, text: "أَسْتَغْفِرُ اللَّهَ", count: 3, translation: "I seek forgiveness from Allah." },
        { id: 302, text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, translation: "O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honor." },
        { id: 303, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, translation: "None has the right to be worshipped except Allah, alone, without partner..." },
        { id: 304, text: "سُبْحَانَ اللَّهِ", count: 33, translation: "Glory be to Allah." },
        { id: 305, text: "الْحَمْدُ لِلَّهِ", count: 33, translation: "Praise be to Allah." },
        { id: 306, text: "اللَّهُ أَكْبَرُ", count: 33, translation: "Allah is the Greatest." },
        { id: 307, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, translation: "Completing the 100 — There is no god but Allah alone..." },
        { id: 308, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", count: 1, translation: "Ayat al-Kursi — after every obligatory prayer." },
        { id: 309, text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", count: 1, translation: "O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner." },
    ],
    quran: [
        { id: 401, text: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ", count: 1, translation: "Last two verses of Surah Al-Baqarah — Recite at night." },
        { id: 402, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (سورة الملك)", count: 1, translation: "Surah Al-Mulk — Recite before sleeping; it intercedes for its reciter." },
        { id: 403, text: "الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ (سورة الكهف)", count: 1, translation: "Surah Al-Kahf — Recite on Friday; it illuminates between the two Fridays." },
        { id: 404, text: "قُلْ هُوَ اللَّهُ أَحَدٌ (سورة الإخلاص)", count: 3, translation: "Surah Al-Ikhlas 3 times — equals reciting the whole Quran." },
    ],
    general: [
        { id: 501, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", count: 100, translation: "Glory is to Allah and praise is to Him, Glory is to Allah the Magnificent. (Beloved to Allah, light on the tongue)" },
        { id: 502, text: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", count: 100, translation: "I seek forgiveness from Allah, besides Whom none has the right to be worshipped, the Ever-Living, the Self-Subsisting, and I repent to Him." },
        { id: 503, text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 100, translation: "There is no might nor power except with Allah. (A treasure from the treasures of Paradise)" },
        { id: 504, text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ", count: 100, translation: "O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim..." },
        { id: 505, text: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", count: 100, translation: "Glory be to Allah, Praise be to Allah, There is no god but Allah, Allah is the Greatest." },
        { id: 506, text: "لَا إِلَهَ إِلَّا اللَّهُ", count: 100, translation: "There is no god but Allah." },
    ],
};

export const CATEGORY_META = {
    morning: { icon: '☀️', label: 'Morning', emoji: '🌅' },
    evening: { icon: '🌙', label: 'Evening', emoji: '🌙' },
    'after-prayer': { icon: '🕌', label: 'After Prayer', emoji: '🕌' },
    quran: { icon: '📖', label: 'Quran', emoji: '📖' },
    general: { icon: '💚', label: 'General', emoji: '💚' },
};
