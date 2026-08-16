export const DEFAULT_TIMEZONE = "Asia/Seoul";

export interface TimeZoneOption {
    value: string;
    label: string;
}

export const TIMEZONE_OPTIONS: TimeZoneOption[] = [
    { value: "Asia/Seoul", label: "서울 (UTC+9)" },
    { value: "Asia/Tokyo", label: "도쿄 (UTC+9)" },
    { value: "Asia/Shanghai", label: "상하이 (UTC+8)" },
    { value: "Asia/Singapore", label: "싱가포르 (UTC+8)" },
    { value: "Asia/Kolkata", label: "인도 (UTC+5:30)" },
    { value: "Asia/Dubai", label: "두바이 (UTC+4)" },
    { value: "Europe/Moscow", label: "모스크바 (UTC+3)" },
    { value: "Europe/Berlin", label: "베를린 (UTC+1/+2)" },
    { value: "Europe/London", label: "런던 (UTC+0/+1)" },
    { value: "UTC", label: "협정 세계시 (UTC)" },
    { value: "America/Sao_Paulo", label: "상파울루 (UTC-3)" },
    { value: "America/New_York", label: "뉴욕 (UTC-5/-4)" },
    { value: "America/Chicago", label: "시카고 (UTC-6/-5)" },
    { value: "America/Denver", label: "덴버 (UTC-7/-6)" },
    { value: "America/Los_Angeles", label: "로스앤젤레스 (UTC-8/-7)" },
    { value: "Pacific/Honolulu", label: "호놀룰루 (UTC-10)" },
    { value: "Australia/Sydney", label: "시드니 (UTC+10/+11)" },
    { value: "Pacific/Auckland", label: "오클랜드 (UTC+12/+13)" },
];

export function isValidTimeZone(tz: string): boolean {
    if (!tz) return false;
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

/** 브라우저/OS 가 알려주는 시간대. 목록에 없으면 기본값으로 떨어진다. */
export function detectTimeZone(): string {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz && isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
    } catch {
        return DEFAULT_TIMEZONE;
    }
}

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(tz: string): Intl.DateTimeFormat {
    let f = partsCache.get(tz);
    if (!f) {
        f = new Intl.DateTimeFormat("en-CA", {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        partsCache.set(tz, f);
    }
    return f;
}

/**
 * 지정한 시간대 기준의 달력일을 YYYY-MM-DD 로 만든다.
 * 브라우저의 OS 시간대가 아니라 사용자가 고른 시간대를 따른다.
 */
export function zonedDateKey(input: Date | string | number, tz: string): string {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    const safeTz = isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
    // en-CA 는 YYYY-MM-DD 형식을 준다
    return formatterFor(safeTz).format(d);
}

/** 그 시간대의 '오늘' 달력일 */
export function zonedToday(tz: string): string {
    return zonedDateKey(new Date(), tz);
}

/** YYYY-MM-DD 를 시간대와 무관한 고정 기준시각으로 바꾼다 */
export function dateKeyToUtcAnchor(key: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const d = new Date(`${key}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** 그 시간대의 달력일 시작 순간을 실제 시각(Date)으로 돌려준다 */
export function zonedDayStart(key: string, tz: string): Date | null {
    const anchor = dateKeyToUtcAnchor(key);
    if (!anchor) return null;
    const safeTz = isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
    // 기준시각을 해당 시간대로 읽었을 때의 오차만큼 되민다
    const asUtc = new Date(anchor.toLocaleString("en-US", { timeZone: "UTC" }));
    const asZone = new Date(anchor.toLocaleString("en-US", { timeZone: safeTz }));
    return new Date(anchor.getTime() + (asUtc.getTime() - asZone.getTime()));
}

export function addDaysToKey(key: string, days: number): string {
    const anchor = dateKeyToUtcAnchor(key);
    if (!anchor) return key;
    anchor.setUTCDate(anchor.getUTCDate() + days);
    return anchor.toISOString().slice(0, 10);
}
