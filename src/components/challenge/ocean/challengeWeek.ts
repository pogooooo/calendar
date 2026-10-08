/**
 * 바다의 챌린지 카드가 쓰는 셈 — 지난 이레의 칸과, 끊기지 않고 이어 온 칸 수.
 * 날 셈은 스티커 판(ChallengeView)과 같은 src/lib/challengeDays.ts: 오늘·시작일은 사용자 시간대의 날,
 * 완료 기록은 서버가 적은 UTC 날 (예전엔 기기 시간대로 읽어 서쪽 시간대에서 하루씩 밀렸다).
 */
import type { ChallengeType } from "@/types";
import { localDateKey } from "@/lib/dateKey";
import { addDaysToKey } from "@/lib/timezone";
import { completionKey, slotIndexOn, slotKey, slotsUntil } from "@/lib/challengeDays";

const doneKeys = (c: ChallengeType) => new Set((c.completions ?? []).map(completionKey));

/** done: 해낸 칸 · miss: 놓친 칸 · open: 아직 비어 있는 오늘 칸 · off: 칸이 아닌 날 */
export type DayMark = "done" | "miss" | "open" | "off";
/** date 는 그날 0시(기기 시각) — 요일 글자를 고르는 데만 쓴다 */
export interface WeekDay { key: string; date: Date; mark: DayMark; today: boolean }

/** 오늘로 끝나는 이레 */
export function weekOf(c: ChallengeType, todayKey = localDateKey(new Date())): WeekDay[] {
    const done = doneKeys(c);
    return Array.from({ length: 7 }, (_, i) => {
        const key = addDaysToKey(todayKey, i - 6);
        const date = new Date(`${key}T00:00:00`);
        const isToday = i === 6;
        if (slotIndexOn(c, key) === null) return { key, date, mark: "off", today: isToday };
        if (done.has(key)) return { key, date, mark: "done", today: isToday };
        return { key, date, mark: isToday ? "open" : "miss", today: isToday };
    });
}

/** 마지막 칸에서 거꾸로, 끊기지 않고 해낸 칸 수. 오늘 칸이 아직 비었으면 그 앞 칸부터 센다 (하루가 끝나야 끊긴 것) */
export function streakOf(c: ChallengeType, todayKey = localDateKey(new Date())): number {
    const passed = slotsUntil(c, todayKey);
    if (passed === 0) return 0;
    const done = doneKeys(c);
    let i = passed - 1;
    if (c.targetCount != null) i = Math.min(i, c.targetCount - 1);
    if (i >= 0 && slotKey(c, i) === todayKey && !done.has(todayKey)) i -= 1;
    let n = 0;
    while (i >= 0 && done.has(slotKey(c, i))) { n += 1; i -= 1; }
    return n;
}
