"use client";

import type { MonthArchProps } from "../parts/MonthArch";
import { labelKey, localDateKey } from "@/lib/dateKey";
import * as S from "./OceanMonthArch.styles";

/* 큰 날짜는 장식 글씨라 라틴 이름으로 (달력 머리의 "October" 와 같은 손) */
const LATIN_MONTH = new Intl.DateTimeFormat("en", { month: "long" });
const LATIN_DAY = new Intl.DateTimeFormat("en", { weekday: "long" });

/**
 * 바다의 달 — 잡지 표지처럼 쓴 날짜와 그달의 가는 눈금 띠.
 * 위: 작은 고정폭 꼬리표(오늘·요일), 기울인 세리프 달 이름 + 굵은 날 숫자.
 * 아래: 날마다 눈금 하나 — 지난날은 옅은 먹, 보는 날은 청록, 일정이 있는 날엔 점 하나(기념일은 산호).
 * 요약 한 줄(10월 · 남은 n · 끝낸 n)은 HomeView 의 ArchFoot 이 둘 사이에 선다 (order 로 자리를 잡는다).
 */
export default function OceanMonthArch({ daysInMonth, focusIdx, monthLoad, marks, focus }: MonthArchProps) {
    // focus 는 칸 Date(고른 시간대의 날) — 오늘도 고른 시간대로 견준다 (기기 시각과 견주면 시간대가 다를 때 'Today' 가 엉뚱한 날에 붙었다)
    const isToday = !!focus && labelKey(focus) === localDateKey(new Date());
    const anniversary = new Set(marks.filter((m) => m.kind === "anv").map((m) => m.day - 1));
    const due = new Set(marks.filter((m) => m.kind === "due").map((m) => m.day - 1));

    const tick = (i: number) => [
        i < focusIdx ? "past" : i === focusIdx ? "now" : "",
        anniversary.has(i) ? "anv" : (monthLoad[i] ?? 0) > 0 || due.has(i) ? "busy" : "",
    ].filter(Boolean).join(" ");

    return (
        <>
            {focus && (
                <S.Hero aria-hidden="true">
                    <span className="eyebrow">{isToday ? "Today · " : ""}{LATIN_DAY.format(focus)}</span>
                    <span className="date">
                        <em>{LATIN_MONTH.format(focus)}</em>
                        <b>{focus.getDate()}</b>
                    </span>
                </S.Hero>
            )}
            <S.Strip aria-hidden="true">
                {Array.from({ length: daysInMonth }, (_, i) => <i key={i} className={tick(i)} />)}
            </S.Strip>
        </>
    );
}
