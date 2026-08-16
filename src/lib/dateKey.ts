import useSettingStore from "@/store/useSettingStore";
import { zonedDateKey, DEFAULT_TIMEZONE } from "@/lib/timezone";

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
