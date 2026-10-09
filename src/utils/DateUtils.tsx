import { labelKey, localDateKey, endDateKey, wallNow } from "@/lib/dateKey";

export const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
};

/** 칸 Date 끼리(이 기기 시각의 연·월·일) 견준다 — 일정의 시각과 견줄 때는 날 키로 (localDateKey · isBetween) */
export const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

// 일정이 머무는 마지막 순간 — 정의는 src/lib/dateKey.ts (서로 부르던 고리를 끊으려고 그쪽으로 옮겼다)
export { lastInstant } from "@/lib/dateKey";

export const isBetween = (
    target: Date,
    startStr?: string | number | Date | null,
    endStr?: string | number | Date | null
): boolean => {
    if (!startStr || !endStr) return false;
    // 칸(target)의 날이 일정이 걸친 날들(고른 시간대) 안인가 — 홈·위젯과 같은 셈.
    // 예전엔 이 기기 0시끼리 견줘서, 기기와 고른 시간대가 다르면 일정이 홈과 다른 칸에 섰다
    const key = labelKey(new Date(target));
    return localDateKey(startStr) <= key && key <= endDateKey(startStr, endStr);
};

/** 그 주(일~토)의 칸 Date 들 — 칸 Date 를 받는다(기본은 고른 시간대의 지금) */
export const getWeekDates = (baseDate: Date = wallNow()): Date[] => {
    const day = baseDate.getDay();
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        return date;
    });
};