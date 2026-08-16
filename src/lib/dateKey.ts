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

export const parseExcludedDates = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(v => typeof v === "string") : [];
    } catch {
        return [];
    }
};
