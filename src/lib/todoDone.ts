/**
 * 일정 한 회차의 끝냄 — 어디서 보든(달력·홈·위젯·카테고리) 같은 셈.
 *
 * 여러 날에 걸친 일정은 한 번 끝낸다. 기록은 그 회차의 첫날에 적는다(달력이 그렇게 적어 왔다).
 * 예전 홈·위젯은 보던 날에 적어서, 사흘짜리를 둘째 날에 끝내면 달력 막대는 그대로였고 셋째 날 홈엔 다시 안 끝난 것으로 섰다.
 * 그때 가운데 날에 적힌 기록도 그 회차 안이면 끝난 것으로 본다. 반복 일정은 회차가 겹칠 수 있어 첫날 기록만 센다.
 */
import { localDateKey, endDateKey, utcDayKey, lastInstant } from "@/lib/dateKey";
import { zonedDateKey } from './timezone';

export interface Occurrence {
    startAt?: string | number | Date | null;
    endAt?: string | number | Date | null;
    repeat?: number | null;
    completions?: { targetDate: string | Date }[] | null;
}

/** 회차의 첫날 — 끝냄을 적는 날 */
export const occurrenceKey = (t: Occurrence, timezone?: string): string => (t.startAt ? (timezone ? zonedDateKey(t.startAt, timezone) : localDateKey(t.startAt)) : "");

/** 이 회차를 끝냈다고 적힌 날들 (보통 하나, 예전 기록이면 가운데 날일 수도) */
export function doneKeysIn(t: Occurrence, timezone?: string): string[] {
    const start = occurrenceKey(t, timezone);
    if (!start) return [];
    const end = t.endAt && !(t.repeat && t.repeat > 0)
        ? (timezone ? zonedDateKey(lastInstant(t.startAt!, t.endAt), timezone) : endDateKey(t.startAt!, t.endAt)) : start;
    return (t.completions ?? []).map((c) => utcDayKey(c.targetDate)).filter((k) => start <= k && k <= end);
}

export const isOccurrenceDone = (t: Occurrence, timezone?: string): boolean => doneKeysIn(t, timezone).length > 0;

/**
 * 회차의 끝냄을 뒤집는다 — 끝났으면 회차 안의 기록을 모두 지우고, 아니면 첫날에 적는다.
 * toggle 은 날짜 키(YYYY-MM-DD)를 받는 할 일 저장소의 뒤집기 (useTodoStore.toggleTodo).
 */
export async function toggleOccurrence(t: Occurrence, toggle: (dayKey: string) => Promise<void>): Promise<void> {
    const done = doneKeysIn(t);
    if (done.length) {
        for (const key of new Set(done)) await toggle(key);
        return;
    }
    const key = occurrenceKey(t);
    if (key) await toggle(key);
}
