import { useMemo } from 'react';

const HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const toArabicNum = (num) => {
    const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(Math.abs(Math.round(num))).split('').map(c => d[parseInt(c)] ?? c).join('');
};

const gregorianToHijri = (date) => {
    // Julian Day Number
    const Y = date.getFullYear();
    const M = date.getMonth() + 1;
    const D = date.getDate();

    const JD = Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4)
        + Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12)
        - Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4)
        + D - 32075;

    // Hijri from JD
    let l = JD - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
        + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
        - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l) / 709);
    const day = l - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    return { day, month, year };
};

export function useHijriDate() {
    return useMemo(() => {
        const today = new Date();
        const { day, month, year } = gregorianToHijri(today);

        const monthIdx = Math.max(0, Math.min(11, month - 1));
        const monthName = HIJRI_MONTHS[monthIdx];

        const arabicString = `${toArabicNum(day)} ${monthName} ${toArabicNum(year)} هـ`;

        // Special dates
        const isRamadan = month === 9;
        const isDhulHijjah = month === 12;
        const isSpecial = isRamadan || isDhulHijjah || month === 7; // Rajab

        return {
            day,
            month,
            monthName,
            year,
            arabicString,
            isRamadan,
            isDhulHijjah,
            isSpecial,
        };
    }, []);
}
