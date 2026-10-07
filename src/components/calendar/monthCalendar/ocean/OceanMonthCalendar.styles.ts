/**
 * 바다의 월간 — 칸 사이가 붙은 금빛 격자(Celestial), 종이 원장(Maple) 대신
 * **틈을 두고 떠 있는 둥근 물 타일**. 요일 머리는 알약 띠, 오늘은 숫자 둘레로 번지는 물결 고리,
 * 일정 막대는 물빛 알약(여러 날짜면 틈을 건너 이어진다), "+N" 은 진주 알약.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { R, glass, ripple, calm, seaButton } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/CelestialMonthCalendar.styles";

const GAP = 5;

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
`;

/** ‹ 2026년 10월 › — 동그란 물방울 화살표 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-weight: 700;
    .nav-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        ${seaButton("default")}
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
`;

export const TodayButton = styled(C.TodayButton)`
    ${seaButton("default")}
    height: 30px;
    padding: 0 14px;
    font-size: 0.8rem;
    &:disabled { opacity: 0.4; }
`;

/** 요일 머리 — 실선 상자와 모서리 사선 대신 알약 띠 */
export const Header = styled(C.Header)`
    border: none;
    border-radius: ${R.pill};
    background: ${(p) => withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.12 : 0.18)};
    margin-bottom: 6px;
    &::after { display: none; }
    [data-widget] & { border: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    border: none !important;
    .day-name {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-weight: 700;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
    }
`;

export const GridContainer = styled(C.GridContainer)`
    border: none;
    gap: ${GAP}px;
    grid-template-rows: repeat(6, minmax(58px, 1fr));
    [data-widget] & { gap: 3px; }
    ${MOBILE} { ${NOT_WIDGET} & { gap: 3px; } }
`;

export const WeekRowContainer = styled(C.WeekRowContainer)`
    border-bottom: none;
    gap: ${GAP}px;
    min-height: 0;
    [data-widget] & { gap: 3px; }
    ${MOBILE} { gap: 3px; }
`;

/** 칸 하나 — 떠 있는 물 타일. 고르면 물빛 테두리, 올리면 살짝 떠오른다 */
export const DayCell = styled(C.DayCell)`
    border-right: none;
    border-radius: 14px;
    overflow: hidden; /* 둥근 타일 밖으로 막대·+N 이 비어져 나오지 않게 */
    background-color: ${(p) => withAlpha(p.theme.mode === "dark" ? p.theme.colors.primary : "#FFFFFF", p.theme.mode === "dark" ? 0.05 : 0.55)};
    box-shadow: ${(p) => p.$dropTarget
        ? `inset 0 0 0 2px ${p.theme.colors.primary}`
        : p.$isSelected
            ? `inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.7)}, 0 6px 16px ${withAlpha(p.theme.colors.primary, 0.14)}`
            : `inset 0 0 0 1px ${withAlpha(p.theme.colors.primary, 0.08)}`};
    transition: transform 0.2s ease, box-shadow 0.25s ease, background-color 0.25s ease;

    &:hover { transform: translateY(-1px); background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.16)}; }

    .day-header {
        .day-number {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-weight: ${(p) => (p.$isToday || p.$isSelected ? 700 : 600)};
            position: relative;
            ${(p) => p.$isToday && css`
                color: ${p.theme.mode === "dark" ? p.theme.colors.background : "#FFFFFF"};
                padding: 0 6px;
                border-radius: ${R.pill};
                background: linear-gradient(135deg, ${p.theme.colors.primary}, ${p.theme.colors.accent});
                box-shadow: 0 3px 8px ${withAlpha(p.theme.colors.primary, 0.35)};
                &::after {
                    content: "";
                    position: absolute;
                    inset: -4px;
                    border-radius: ${R.pill};
                    border: 1.5px solid ${withAlpha(p.theme.colors.primary, 0.5)};
                    animation: ${ripple} 3.4s ease-out infinite;
                    ${calm}
                }
            `}
        }
    }
`;

/** 오늘 원반(별 시계)은 바다에 없다 — 숫자 둘레의 물결 고리가 대신한다 */
export const TodayDisc = styled(C.TodayDisc)`
    display: none;
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    border-radius: 50%;
    border: none;
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => withAlpha(p.theme.colors.accent, 0.22)};
`;

/** 일정 막대 — 물빛 알약. 여러 날에 걸치면 칸 사이 틈을 건너 이어진다 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    height: 20px;
    background: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.14 : 0.24)};
    color: ${(p) => p.theme.colors.text};
    border-radius: ${(p) => `${p.$isStart ? 999 : 0}px ${p.$isEnd ? 999 : 0}px ${p.$isEnd ? 999 : 0}px ${p.$isStart ? 999 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "4px" : `-${GAP}px`)};
    margin-right: ${(p) => (p.$isEnd ? "4px" : `-${GAP}px`)};
    box-shadow: ${(p) => (p.$isStart ? `inset 3px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    .todo-title { font-weight: 600; padding-left: 8px; ${(p) => p.$isDone && css`text-decoration: line-through; opacity: 0.6;`} }
`;

export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin-left: 4px;
    padding: 1px 9px;
    border-radius: ${R.pill};
    border: none;
    font-family: ${(p) => p.theme.fonts.numeral};
    font-weight: 700;
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => withAlpha(p.theme.colors.accent, 0.22)};
`;

export const CompactTaskCount = styled(C.CompactTaskCount)`
    border-radius: ${R.pill};
    border: none;
    background: ${(p) => withAlpha(p.theme.colors.accent, 0.3)};
    color: ${(p) => p.theme.colors.primary};
`;

export const MoveNotice = styled(C.MoveNotice)`
    ${glass("solid")}
    border-radius: ${R.pill};
`;
