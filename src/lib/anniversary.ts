import type { AnniversaryType } from "@/store/useAnniversaryStore";

type MonthDay = Pick<AnniversaryType, "month" | "day">;

/** 그해 그 달의 기념일 날(일) — 2월 29일은 윤년이 아니면 2월 28일 (안드로이드 위젯 Snapshot.kt 와 같은 약속).
    예전엔 화면마다 new Date(해, 1, 29) 가 3월 1일로 넘어가서, 위젯은 2/28·앱은 3/1 에 D-DAY 를 띄우고 달력엔 아무 날에도 없었다 */
export const anniversaryDayIn = (a: MonthDay, year: number) =>
    Math.min(a.day, new Date(year, a.month, 0).getDate());

export const anniversariesOn = (list: AnniversaryType[], date: Date) =>
    list.filter(a => a.month === date.getMonth() + 1 && anniversaryDayIn(a, date.getFullYear()) === date.getDate());

/** 오늘(그날의 0시) 기준으로 다음에 돌아오는 날(오늘 포함)과 남은 날 수 */
export function nextAnniversary(a: MonthDay, today: Date): { date: Date; diff: number } {
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const on = (year: number) => new Date(year, a.month - 1, anniversaryDayIn(a, year));
    let date = on(base.getFullYear());
    if (date.getTime() < base.getTime()) date = on(base.getFullYear() + 1);
    return { date, diff: Math.round((date.getTime() - base.getTime()) / 86400000) };
}
