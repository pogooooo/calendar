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

/**
 * 일정이 머무는 마지막 순간 — 끝이 딱 0시면 그날은 걸치지 않는다(끝은 그 순간을 빼고 센다).
 * 예전엔 23:00~0:00(밤 11시에 기본 한 시간)이 다음 날 칸·오늘 목록·위젯에도 섰다. 길이가 0 이면 시작 그 순간.
 * 마지막 "날"을 셀 때만 쓴다 — 끝 시각을 보여 주거나 길이를 잴 때는 원래 끝을 쓴다.
 */
export const lastInstant = (start: string | number | Date, end: string | number | Date): number =>
    Math.max(new Date(start).getTime(), new Date(end).getTime() - 1);

export const isBetween = (
    target: Date,
    startStr?: string | number | Date | null,
    endStr?: string | number | Date | null
): boolean => {
    if (!startStr || !endStr) return false;
    const t = new Date(target).setHours(0, 0, 0, 0);
    const s = new Date(startStr).setHours(0, 0, 0, 0);
    const e = new Date(lastInstant(startStr, endStr)).setHours(0, 0, 0, 0);
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