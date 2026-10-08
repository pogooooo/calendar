/**
 * 챌린지의 날 셈 — 모두 날짜 키(YYYY-MM-DD)로 한다.
 *
 * 예전 챌린지 화면은 기기 시각의 0시로 셈하고 완료 기록도 기기 시각으로 읽었는데, 서버는 완료를 그날의 UTC 0시로
 * 저장한다. 그래서 서쪽(UTC-) 시간대에서는 오늘 달성을 눌러도 기록이 어제로 읽혀 단추가 그대로였고, 다시 누르면
 * 서버에서는 지워졌다. 홈·위젯처럼 완료는 UTC 날로, 오늘·시작일은 사용자가 고른 시간대의 날로 읽는다.
 */
import { localDateKey, utcDayKey } from "@/lib/dateKey";
import { addDaysToKey } from "@/lib/timezone";
import { calendarDayDelta } from "@/lib/taskInteractions";

type ChallengeDays = { startAt: string | Date; interval: number; targetCount?: number | null };

/** 완료 기록이 가리키는 날 — 서버가 그날의 UTC 0시로 저장한다 */
export const completionKey = (c: { targetDate: string | Date }) => utcDayKey(c.targetDate);

/** 시작일 — 새 챌린지는 그날의 정오(UTC)로 저장한다(어느 시간대에서든 그날). 그 밖의 예전 값은 그 순간이 놓이는 날 */
export function challengeStartKey(startAt: string | Date): string {
    const d = new Date(startAt);
    if (Number.isNaN(d.getTime())) return "";
    const iso = d.toISOString();
    return iso.endsWith("T12:00:00.000Z") ? iso.slice(0, 10) : localDateKey(d);
}

const step = (c: ChallengeDays) => Math.max(1, c.interval || 1);

/** i 번째 칸(0부터)의 날 */
export const slotKey = (c: ChallengeDays, i: number) => addDaysToKey(challengeStartKey(c.startAt), i * step(c));

/** 그날이 몇 번째 칸인가 — 칸이 아니면 null (시작 전, 사이 날, 목표 뒤) */
export function slotIndexOn(c: ChallengeDays, key: string): number | null {
    const start = challengeStartKey(c.startAt);
    if (!start || !key) return null;
    const diff = calendarDayDelta(start, key);
    if (diff < 0 || diff % step(c) !== 0) return null;
    const i = diff / step(c);
    if (c.targetCount != null && i >= c.targetCount) return null;
    return i;
}

/** 시작일부터 그날까지 지나온 칸 수 (그날이 칸이면 그 칸까지). 시작 전이면 0 */
export function slotsUntil(c: ChallengeDays, key: string): number {
    const start = challengeStartKey(c.startAt);
    if (!start || !key) return 0;
    const diff = calendarDayDelta(start, key);
    return diff < 0 ? 0 : Math.floor(diff / step(c)) + 1;
}

/** 목표가 있는 챌린지의 마지막 칸이 지났는가 */
export function challengeExpired(c: ChallengeDays, todayKey: string): boolean {
    if (c.targetCount == null) return false;
    return todayKey > slotKey(c, c.targetCount - 1);
}

/** 그날을 완료로 보낼 값 — 정오(UTC)로 보내면 서버가 그날의 0시로 자른다 (어느 시간대에서든 같은 날) */
export const completionTargetFor = (key: string) => `${key}T12:00:00.000Z`;
