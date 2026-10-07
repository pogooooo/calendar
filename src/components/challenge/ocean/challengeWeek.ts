/**
 * 바다의 챌린지 카드가 쓰는 셈 — 지난 이레의 칸과, 끊기지 않고 이어 온 칸 수.
 * 날짜는 스티커 판(ChallengeView)과 같은 셈을 쓴다: 시작일의 그날 0시에서 interval 일마다 한 칸, 완료 기록은 기기 시간대의 그날.
 */
import type { ChallengeType } from "@/types";

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const midnight = (v: string | number | Date) => {
    const d = new Date(v);
    d.setHours(0, 0, 0, 0);
    return d;
};
const doneKeys = (c: ChallengeType) => new Set((c.completions ?? []).map((x) => keyOf(new Date(x.targetDate))));

/** 그날이 몇 번째 칸인가 — 칸이 아니면 null (시작 전, 사이 날, 목표 뒤) */
function slotOf(c: ChallengeType, day: Date): number | null {
    const diff = Math.round((day.getTime() - midnight(c.startAt).getTime()) / DAY);
    if (diff < 0 || diff % c.interval !== 0) return null;
    const i = diff / c.interval;
    if (c.targetCount != null && i >= c.targetCount) return null;
    return i;
}

/** done: 해낸 칸 · miss: 놓친 칸 · open: 아직 비어 있는 오늘 칸 · off: 칸이 아닌 날 */
export type DayMark = "done" | "miss" | "open" | "off";
export interface WeekDay { date: Date; mark: DayMark; today: boolean }

/** 오늘로 끝나는 이레 */
export function weekOf(c: ChallengeType, now = new Date()): WeekDay[] {
    const today = midnight(now);
    const done = doneKeys(c);
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - 6 + i);
        const isToday = i === 6;
        if (slotOf(c, date) === null) return { date, mark: "off", today: isToday };
        if (done.has(keyOf(date))) return { date, mark: "done", today: isToday };
        return { date, mark: isToday ? "open" : "miss", today: isToday };
    });
}

/** 마지막 칸에서 거꾸로, 끊기지 않고 해낸 칸 수. 오늘 칸이 아직 비었으면 그 앞 칸부터 센다 (하루가 끝나야 끊긴 것) */
export function streakOf(c: ChallengeType, now = new Date()): number {
    const today = midnight(now);
    const start = midnight(c.startAt);
    const diff = Math.round((today.getTime() - start.getTime()) / DAY);
    if (diff < 0) return 0;
    const done = doneKeys(c);
    const slotDate = (i: number) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i * c.interval);
        return d;
    };
    let i = Math.floor(diff / c.interval);
    if (c.targetCount != null) i = Math.min(i, c.targetCount - 1);
    if (i >= 0 && keyOf(slotDate(i)) === keyOf(today) && !done.has(keyOf(today))) i -= 1;
    let n = 0;
    while (i >= 0 && done.has(keyOf(slotDate(i)))) { n += 1; i -= 1; }
    return n;
}
