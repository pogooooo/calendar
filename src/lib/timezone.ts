export const DEFAULT_TIMEZONE = "Asia/Seoul";

export interface TimeZoneOption {
    value: string;
    label: string;
    /** 영어 화면의 이름 (없으면 label) — 예전엔 영어 화면에도 "서울 (UTC+9)" 이 떴다 */
    labelEn?: string;
}

export const TIMEZONE_OPTIONS: TimeZoneOption[] = [
    { value: "Asia/Seoul", label: "서울 (UTC+9)", labelEn: "Seoul (UTC+9)" },
    { value: "Asia/Tokyo", label: "도쿄 (UTC+9)", labelEn: "Tokyo (UTC+9)" },
    { value: "Asia/Shanghai", label: "상하이 (UTC+8)", labelEn: "Shanghai (UTC+8)" },
    { value: "Asia/Singapore", label: "싱가포르 (UTC+8)", labelEn: "Singapore (UTC+8)" },
    { value: "Asia/Kolkata", label: "인도 (UTC+5:30)", labelEn: "India (UTC+5:30)" },
    { value: "Asia/Dubai", label: "두바이 (UTC+4)", labelEn: "Dubai (UTC+4)" },
    { value: "Europe/Moscow", label: "모스크바 (UTC+3)", labelEn: "Moscow (UTC+3)" },
    { value: "Europe/Berlin", label: "베를린 (UTC+1/+2)", labelEn: "Berlin (UTC+1/+2)" },
    { value: "Europe/London", label: "런던 (UTC+0/+1)", labelEn: "London (UTC+0/+1)" },
    { value: "UTC", label: "협정 세계시 (UTC)", labelEn: "Coordinated Universal Time (UTC)" },
    { value: "America/Sao_Paulo", label: "상파울루 (UTC-3)", labelEn: "São Paulo (UTC-3)" },
    { value: "America/New_York", label: "뉴욕 (UTC-5/-4)", labelEn: "New York (UTC-5/-4)" },
    { value: "America/Chicago", label: "시카고 (UTC-6/-5)", labelEn: "Chicago (UTC-6/-5)" },
    { value: "America/Denver", label: "덴버 (UTC-7/-6)", labelEn: "Denver (UTC-7/-6)" },
    { value: "America/Los_Angeles", label: "로스앤젤레스 (UTC-8/-7)", labelEn: "Los Angeles (UTC-8/-7)" },
    { value: "Pacific/Honolulu", label: "호놀룰루 (UTC-10)", labelEn: "Honolulu (UTC-10)" },
    { value: "Australia/Sydney", label: "시드니 (UTC+10/+11)", labelEn: "Sydney (UTC+10/+11)" },
    { value: "Pacific/Auckland", label: "오클랜드 (UTC+12/+13)", labelEn: "Auckland (UTC+12/+13)" },
];

/** 시간대 이름마다 한 번만 재 본다 — 날 키(zonedDateKey)를 셀 때마다 서식기를 새로 만들면(한 번에 0.1ms 쯤) 달력 칸마다 쌓인다 */
const validZones = new Map<string, boolean>();

export function isValidTimeZone(tz: string): boolean {
    if (!tz) return false;
    const known = validZones.get(tz);
    if (known !== undefined) return known;
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        validZones.set(tz, true);
        return true;
    } catch {
        validZones.set(tz, false);
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

/** 어떤 시간대의 벽시계 (월은 1부터) */
export interface WallTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

const wallCache = new Map<string, Intl.DateTimeFormat>();

function wallFormatter(tz: string): Intl.DateTimeFormat {
    let f = wallCache.get(tz);
    if (!f) {
        const make = (zone: string) => new Intl.DateTimeFormat("en-US", {
            timeZone: zone, hourCycle: "h23",
            year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
        });
        // 모르는 시간대면 날 키(zonedDateKey)처럼 기본 시간대로 읽는다
        try { f = make(tz); } catch { f = make(DEFAULT_TIMEZONE); }
        wallCache.set(tz, f);
    }
    return f;
}

/** 그 순간을 그 시간대의 벽시계로 읽는다. 깨진 값이면 null */
export function zonedWallTime(input: Date | string | number, tz: string): WallTime | null {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    const p: Record<string, number> = {};
    for (const part of wallFormatter(tz).formatToParts(d)) {
        if (part.type !== "literal") p[part.type] = Number(part.value);
    }
    return { year: p.year, month: p.month, day: p.day, hour: p.hour % 24, minute: p.minute, second: p.second };
}

/**
 * 그 시간대에서 key 날 hour:minute 벽시계가 가리키는 실제 순간.
 * 서머타임으로 건너뛴 시각은 빠진 만큼 뒤로 밀고, 두 번 오는 시각은 앞의 것 — new Date(연, 월, 일, 시, 분) 과 같은 셈이다.
 * (zonedDayStart 는 그 날 UTC 0시의 시차를 써서, 시드니·오클랜드처럼 동쪽 시간대의 서머타임 바뀌는 날에 한 시간 어긋난다)
 */
export function zonedTimeToDate(key: string, hour: number, minute: number, tz: string, second = 0, ms = 0): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    if (!m) return null;
    const wall = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, minute, second, ms);
    if (Number.isNaN(wall)) return null;
    // 그 순간의 시차 (벽시계 − 실제 시각)
    const offsetAt = (t: number) => {
        const w = zonedWallTime(t, tz);
        return w ? Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - Math.floor(t / 1000) * 1000 : 0;
    };
    const before = offsetAt(wall - 86400000);
    const after = offsetAt(wall + 86400000);
    if (before === after) return new Date(wall - before);
    // 하루 사이에 시차가 바뀐다 — 그 벽시계가 실제로 나오는 순간만 고른다
    const fits = [wall - before, wall - after].filter(t => offsetAt(t) === wall - t);
    return new Date(fits.length ? Math.min(...fits) : wall - before);
}
