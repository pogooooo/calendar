/**
 * 바다의 월간 — 칸 사이가 붙은 금빛 격자(Celestial), 종이 원장(Maple) 대신
 * **틈을 두고 물 위에 떠 있는 바다유리 조각들**. 요일은 가는 세리프 글자만, 오늘은 숫자 뒤에 앉은 주황 불가사리,
 * 일정 막대는 물빛 알약(여러 날짜면 틈을 건너 이어진다), "+N" 은 물방울 알약.
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { R, glass, calm, seaButton, LATIN, starfishImage } from "@/styles/ocean/water";
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

/** 요일 머리 — 실선 상자·모서리 사선(Celestial) 대신 상자 없이 글자만 물 위에 */
export const Header = styled(C.Header)`
    border: none;
    margin-bottom: 4px;
    &::after { display: none; }
    [data-widget] & { border: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    border: none !important;
    height: 30px;
    .day-name {
        font-family: ${LATIN};
        font-size: 0.8rem;
        letter-spacing: 0.22em;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    &:first-child .day-name { color: ${(p) => p.theme.colors.weekend}; }
    ${MOBILE} { height: 24px; .day-name { font-size: 0.62rem; letter-spacing: 0.12em; } }
`;

export const GridContainer = styled(C.GridContainer)`
    border: none;
    gap: ${GAP}px;
    grid-template-rows: repeat(6, minmax(50px, 1fr));
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

const glassTile = (dark: boolean) => dark
    ? "linear-gradient(160deg, rgba(40, 120, 136, 0.30), rgba(12, 62, 78, 0.22))"
    : "linear-gradient(160deg, rgba(255, 255, 255, 0.80), rgba(226, 249, 246, 0.52))";

/** 칸 하나 — 물 위에 뜬 바다유리 조각. 고르면 물빛 테두리가 맺히고, 올리면 살짝 떠오른다 */
export const DayCell = styled(C.DayCell)`
    border-right: none;
    border-radius: 14px;
    overflow: hidden; /* 둥근 타일 밖으로 막대·+N 이 비어져 나오지 않게 */
    background: ${(p) => glassTile(p.theme.mode === "dark")};
    opacity: ${(p) => (p.$isCurrentMonth ? 1 : 0.42)};
    box-shadow: ${(p) => p.$dropTarget
        ? `inset 0 0 0 2px ${p.theme.colors.primary}`
        : p.$isSelected
            ? `inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.75)}, 0 8px 18px -8px ${withAlpha(p.theme.colors.primary, 0.55)}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
            : `inset 0 1px 0 ${p.theme.mode === "dark" ? "rgba(160, 250, 240, 0.12)" : "rgba(255, 255, 255, 0.95)"}, 0 3px 8px -5px ${p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(4, 78, 92, 0.35)"}`};
    transition: transform 0.2s ease, box-shadow 0.25s ease, background-color 0.25s ease;

    &:hover { transform: translateY(-1px); background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }

    .day-header {
        padding: 5px 6px 1px;
        .day-number {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-weight: ${(p) => (p.$isToday || p.$isSelected ? 700 : 600)};
            position: relative;
            ${(p) => p.$isToday && css`
                color: #FFFFFF;
                padding-left: 3px;
                text-shadow: 0 1px 2px rgba(120, 60, 10, 0.55), 0 0 6px rgba(160, 80, 10, 0.35);
            `}
        }
    }
`;

const sway = keyframes`
    0%, 100% { transform: rotate(-14deg) scale(1); }
    50%      { transform: rotate(-4deg) scale(1.04); }
`;

/** 오늘 — 별 시계 원반(Celestial) 대신 숫자 뒤에 앉은 주황 불가사리. 천천히 팔을 흔든다 */
export const TodayDisc = styled(C.TodayDisc)`
    top: -5px;
    left: -6px;
    width: 38px;
    height: 38px;
    margin: 0;
    z-index: 1;
    background: ${starfishImage("amber")} center / contain no-repeat;
    filter: drop-shadow(0 2px 3px rgba(120, 70, 20, 0.3));
    transform: rotate(-14deg);
    animation: ${sway} 6s ease-in-out infinite;
    ${calm}
    & > * { display: none; }
    ${MOBILE} { top: -4px; left: -5px; width: 28px; height: 28px; margin: 0; }
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    border-radius: 50%;
    border: none;
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => withAlpha(p.theme.colors.accent, 0.22)};
`;

export const TodoBarList = styled(C.TodoBarList)`
    margin-top: 3px;
    margin-bottom: 3px;
    gap: 2px;
    /* "+N" 알약이 이 목록 위(날짜 줄)로 떠 있으므로 목록이 그것을 오려 내지 않게 — 칸(DayCell)이 대신 오린다 */
    ${NOT_WIDGET} & { @media (min-width: 769px) { overflow: visible; } }
`;

/**
 * 일정 막대 — 물빛 알약(18px). 여러 날에 걸치면 칸 사이 틈을 건너 이어지고, 위쪽에 햇빛 한 줄이 맺힌다.
 * 폰에서는 마름모(Celestial) 대신 작은 진주 알갱이로 늘어놓는다.
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    height: 18px;
    font-size: 0.72rem;
    background:
        linear-gradient(180deg, rgba(255, 255, 255, ${(p) => (p.theme.mode === "dark" ? 0.06 : 0.45)}), rgba(255, 255, 255, 0) 60%),
        ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.12 : p.theme.mode === "dark" ? 0.32 : 0.26)};
    color: ${(p) => p.theme.colors.text};
    border-radius: ${(p) => `${p.$isStart ? 999 : 0}px ${p.$isEnd ? 999 : 0}px ${p.$isEnd ? 999 : 0}px ${p.$isStart ? 999 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "4px" : `-${GAP}px`)};
    margin-right: ${(p) => (p.$isEnd ? "4px" : `-${GAP}px`)};
    box-shadow: ${(p) => (p.$isStart ? `inset 3px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    &:hover { background-color: transparent; filter: brightness(1.04) saturate(1.15); }
    .todo-title { font-weight: 600; padding-left: 8px; ${(p) => p.$isDone && css`text-decoration: line-through; opacity: 0.6;`} }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 7px;
            height: 7px;
            border: none;
            border-radius: 50%;
            transform: none;
            box-shadow: 0 1px 2px ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, 0.5)};
            background: radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.9) 0 22%, transparent 50%), ${(p) => (p.$isDone ? withAlpha(p.$color ?? p.theme.colors.primary, 0.35) : p.$color ?? p.theme.colors.primary)};
        }
    }
`;

/**
 * "+N" — 막대 한 층을 차지하지 않고 날짜 줄 오른쪽에 떠 있는 물방울 알약.
 * 칸에 들어갈 층 수는 이 단추의 키를 빼고 셈한다(MonthCalendarView 의 fit) — 키를 0 으로 두어 그 몫을 막대에 돌려준다.
 * 위젯·폰은 칸이 좁아 날짜 줄에 둘 자리가 없으니 원래대로 아래에 둔다.
 */
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

    ${NOT_WIDGET} & {
        @media (min-width: 769px) {
            position: absolute;
            top: -22px;
            right: 26px;
            height: 0;
            min-height: 0;
            padding: 0;
            margin: 0;
            background: none;
            overflow: visible;
            .full { display: none; }
            .short {
                display: inline-block;
                transform: translateY(-1px);
                padding: 1px 7px;
                border-radius: ${R.pill};
                font-size: 0.68rem;
                line-height: 15px;
                color: ${(p) => (p.theme.mode === "dark" ? "#062A36" : "#FFFFFF")};
                background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.55) 0 18%, transparent 45%), linear-gradient(135deg, ${(p) => p.theme.colors.accent}, ${(p) => p.theme.colors.primary});
                box-shadow: 0 2px 6px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
            }
            &:hover { background: none; .short { filter: brightness(1.08); } }
        }
    }
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
