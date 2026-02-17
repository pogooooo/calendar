export const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

export const isBetween = (
    target: Date,
    startStr?: string | number | Date | null,
    endStr?: string | number | Date | null
): boolean => {
    if (!startStr || !endStr) return false;
    const t = new Date(target).setHours(0, 0, 0, 0);
    const s = new Date(startStr).setHours(0, 0, 0, 0);
    const e = new Date(endStr).setHours(0, 0, 0, 0);
    return t >= s && t <= e;
};

export const getWeekDates = (baseDate: Date = new Date()): Date[] => {
    const day = baseDate.getDay();
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        return date;
    });
};