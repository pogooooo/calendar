"use client";

import * as S from "./OceanHeroScene.styles";

/** 일정 있는 칸(앞은 여러 날 이어지는 막대의 처음·끝) — 고정 값이라 늘 같은 그림 */
const EVENTS: Record<number, "one" | "start" | "end"> = { 3: "one", 9: "start", 10: "end", 17: "one", 23: "start", 24: "end", 30: "one" };
const TODAY = 10;
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const ROWS = [{ w: 72, done: true }, { w: 58, done: false }, { w: 80, done: false }];

/**
 * 바다의 소개 그림 — 그림 대신 앱 화면을 닮은 반투명 판 두 장(달력 한 달 + 오늘 할 일 쪽지).
 * 도는 금빛 고리(Celestial)·도감 한 장(Maple)과 다르게 "쓰는 모습"을 보여 준다.
 * 마우스를 따라 두 판이 서로 다른 깊이로 아주 조금 움직인다(화면이 넘겨주는 --mx/--my). 끝없는 움직임은 없다.
 */
export default function OceanHeroScene() {
    return (
        <S.Scene aria-hidden="true">
            <S.MonthCard>
                <S.MonthHead>
                    <S.MonthName>October</S.MonthName>
                    <S.Nav><i /><i /></S.Nav>
                </S.MonthHead>
                <S.Week>
                    {DAYS.map((d, i) => <span key={i}>{d}</span>)}
                </S.Week>
                <S.Grid>
                    {Array.from({ length: 35 }, (_, i) => (
                        <S.Cell key={i} $today={i === TODAY} $event={EVENTS[i]} $dim={i > 31} />
                    ))}
                </S.Grid>
            </S.MonthCard>

            <S.TodayCard>
                <S.TodayHead><span>Today</span><b>3</b></S.TodayHead>
                {ROWS.map((r, i) => (
                    <S.TodayRow key={i} $done={r.done}>
                        <i />
                        <span style={{ width: `${r.w}%` }} />
                    </S.TodayRow>
                ))}
                <S.Level><span /></S.Level>
            </S.TodayCard>
        </S.Scene>
    );
}
