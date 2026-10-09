import useSettingStore from "@/store/useSettingStore";
import { zonedDateKey, DEFAULT_TIMEZONE, zonedTimeToDate, zonedWallTime, type WallTime } from "@/lib/timezone";

/**
 * 일정이 머무는 마지막 순간 — 끝이 딱 0시면 그날은 걸치지 않는다(끝은 그 순간을 빼고 센다).
 * 예전엔 23:00~0:00(밤 11시에 기본 한 시간)이 다음 날 칸·오늘 목록·위젯에도 섰다. 길이가 0 이면 시작 그 순간.
 * 마지막 "날"을 셀 때만 쓴다 — 끝 시각을 보여 주거나 길이를 잴 때는 원래 끝을 쓴다.
 */
export const lastInstant = (start: string | number | Date, end: string | number | Date): number =>
    Math.max(new Date(start).getTime(), new Date(end).getTime() - 1);

/**
 * 날짜 키는 사용자가 설정에서 고른 시간대를 기준으로 만든다.
 * OS 시간대를 그대로 쓰면 여행 중이거나 서버 시간대가 다를 때 하루가 어긋난다.
 */
export const activeTimeZone = (): string => {
    try {
        return useSettingStore.getState().timezone || DEFAULT_TIMEZONE;
    } catch {
        return DEFAULT_TIMEZONE;
    }
};

export const localDateKey = (input: Date | string | number) =>
    zonedDateKey(input, activeTimeZone());

/** 일정이 걸친 마지막 날 — 끝이 딱 0시면 앞날까지 (lastInstant) */
export const endDateKey = (start: Date | string | number, end: Date | string | number) =>
    localDateKey(lastInstant(start, end));

/**
 * 완료 기록(TodoCompletion.targetDate)처럼 서버가 UTC 자정으로 저장하는 값을 읽을 때 쓴다.
 * 이 값에 localDateKey 를 쓰면 시간대만큼 하루가 밀린다.
 */
export const utcDayKey = (input: Date | string | number) => {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

/** 날짜 키(YYYY-MM-DD)를 서버로 보낼 때 쓰는 고정 기준시각 문자열 */
export const dayKeyToIso = (key: string) => `${key}T00:00:00.000Z`;

/** 어떤 시각이든 사용자의 시간대 기준 '그 날'을 나타내는 고정 기준시각으로 바꾼다 */
export const toUtcAnchorIso = (input: Date | string | number) =>
    dayKeyToIso(localDateKey(input));

export const parseExcludedDates = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(v => typeof v === "string") : [];
    } catch {
        return [];
    }
};

/* ── 고른 시간대의 날·벽시계 ──────────────────────────────────────────────
   달력 칸·고른 날·시각 고르개는 이 기기 Date 의 연·월·일(·시·분)을 읽는다. 그 Date 에는 고른 시간대의 날·벽시계를 담고
   ("칸 Date"), 일정(실제 순간)과 견주거나 저장할 때만 아래 함수로 바꾼다. 예전엔 칸을 이 기기 시각 그대로 셈해서,
   기기와 고른 시간대가 다르면(여행 중, 서울로 저장된 예전 설치) 달력·일간·창이 홈·위젯과 다른 날·시각을 보였다.
   고른 시간대가 이 기기와 같으면(대부분) 예전 셈을 그대로 쓴다 — 결과가 같고 서머타임 경계까지 예전 그대로다. */

let deviceZone: { tz: string; at: number } | null = null;

/** 이 기기의 시간대 — 재는 데 0.1ms 쯤 들어 잠깐(1초) 붙들되, 여행 중 OS 시간대가 바뀌면 곧 따라간다 */
export const deviceTimeZone = (): string => {
    const now = Date.now();
    if (!deviceZone || now - deviceZone.at > 1000) {
        let tz = "";
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* 모르면 다른 시간대로 본다 */ }
        deviceZone = { tz, at: now };
    }
    return deviceZone.tz;
};

/** 고른 시간대가 이 기기와 같은가 — 같으면 이 기기 Date 셈이 곧 고른 시간대의 셈이다 */
export const sameAsDevice = (tz: string = activeTimeZone()): boolean => tz === deviceTimeZone();

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * 칸 Date(달력 칸·고른 날)의 날 키 — 이 기기 시각의 연·월·일이 곧 고른 시간대의 그 날이다.
 * 칸에 localDateKey 를 쓰면 고른 시간대가 기기보다 서쪽일 때 하루 앞 날이 된다
 */
export const labelKey = (date: Date): string =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** 날 키 → 그 날을 담은 칸 Date (이 기기의 그 날 0시) */
export const labelDate = (key: string): Date => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
};

/** 고른 시간대에서 그 날 hour:minute 의 실제 순간 — 기기와 같은 시간대면 예전처럼 new Date(연, 월, 일, 시, 분) */
export const zonedTime = (key: string, hour = 0, minute = 0): Date => {
    const tz = activeTimeZone();
    if (sameAsDevice(tz)) {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m - 1, d, hour, minute);
    }
    return zonedTimeToDate(key, hour, minute, tz) ?? new Date(NaN);
};

/** 그 순간의 고른 시간대 벽시계 (월은 1부터). 깨진 값이면 null */
export const wallTime = (input: Date | string | number): WallTime | null => {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    const tz = activeTimeZone();
    if (!sameAsDevice(tz)) return zonedWallTime(d, tz);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() };
};

/**
 * 그 순간의 고른 시간대 벽시계를 담은 칸 Date — 칸·시각 고르개처럼 이 기기 Date 의 연월일·시분을 읽는 곳에 넘길 때.
 * 기기와 같은 시간대면 그 순간 그대로다
 */
export const toWallDate = (input: Date | string | number): Date => {
    const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    const tz = activeTimeZone();
    if (Number.isNaN(d.getTime()) || sameAsDevice(tz)) return d;
    const w = zonedWallTime(d, tz)!;
    return new Date(w.year, w.month - 1, w.day, w.hour, w.minute, w.second, d.getMilliseconds());
};

/** toWallDate 의 반대 — 칸 Date 에 담긴 벽시계를 고른 시간대의 실제 순간으로 */
export const fromWallDate = (wall: Date): Date => {
    const tz = activeTimeZone();
    if (Number.isNaN(wall.getTime()) || sameAsDevice(tz)) return new Date(wall.getTime());
    return zonedTimeToDate(labelKey(wall), wall.getHours(), wall.getMinutes(), tz, wall.getSeconds(), wall.getMilliseconds()) ?? new Date(NaN);
};

/** '지금' 을 담은 칸 Date — 칸·고른 날에 new Date() 대신 (기기와 같은 시간대면 new Date() 와 같다) */
export const wallNow = (): Date => toWallDate(Date.now());
