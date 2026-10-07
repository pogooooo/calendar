/**
 * 바다의 월간 — 칸 사이가 붙은 금빛 격자(Celestial), 종이 원장(Maple) 대신
 * **틈을 두고 놓인 유리 칸**. 요일은 작은 고정폭 대문자, 오늘은 빛을 머금은 청록 동그라미 숫자(둘레가 천천히 숨 쉰다),
 * 일정 막대는 옅게 물든 면에 앞쪽 색 띠(여러 날이면 칸 사이 틈을 건너 이어진다), "+N" 은 날짜 줄 오른쪽의 작은 꼬리표.
 * 달을 넘기면 칸들이 왼쪽 위에서 오른쪽 아래로 물결처럼 차례로 떠오른다.
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { EASE, MONO, R, calm, focusRing, hairline, ink, seaButton, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/CelestialMonthCalendar.styles";

const GAP = 4;
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 칸이 떠오른다 — 끝 값은 적지 않는다(다른 달 칸은 옅게 남아야 하므로 원래 불투명도로 돌아간다) */
const tileIn = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
`;
/** 칸마다 늦춤 — 줄 r·칸 c 의 대각선 순서 (r + c) */
const CASCADE = Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) =>
    `${C.WeekRowContainer}:nth-child(${r + 1}) > &:nth-child(${c + 1}) { animation-delay: ${(r + c) * 26}ms; }`).join("\n")).join("\n");
/** 오늘 숫자 둘레의 숨 — 아주 천천히 번졌다 잦아든다 */
const breathe = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 var(--today-halo), 0 4px 12px -2px var(--today-glow); }
    50%      { box-shadow: 0 0 0 5px transparent, 0 4px 16px 0 var(--today-glow); }
`;

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
`;

/** ‹ 2026년 10월 › — 작은 날짜와 글씨만 있는 화살표 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    gap: 2px;
    .nav-btn {
        width: 30px;
        height: 30px;
        padding: 0;
        border-radius: 8px;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.15s ease, color 0.15s ease;
        &:hover { transform: none; color: ${(p) => p.theme.colors.text}; background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)}; }
        ${focusRing}
        svg { width: 18px; height: 18px; }
    }
`;

export const TodayButton = styled(C.TodayButton)`
    ${seaButton("default")}
    height: 28px;
    margin-left: 8px;
    padding: 0 11px;
    font-size: 0.76rem;
    letter-spacing: 0;
    &:hover:not(:disabled) { box-shadow: none; }
    &:disabled { opacity: 0.4; }
`;

/** 요일 머리 — 상자 없이 작은 고정폭 대문자만 */
export const Header = styled(C.Header)`
    border: none;
    margin-bottom: 2px;
    &::after { display: none; }
    [data-widget] & { border: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    border: none !important;
    height: 28px;
    justify-content: flex-start;
    padding-left: 8px;
    .day-name {
        font-family: ${MONO};
        font-size: 0.66rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    &:first-child .day-name { color: ${(p) => p.theme.colors.weekend}; }
    ${MOBILE} { height: 24px; justify-content: center; padding-left: 0; .day-name { font-size: 0.58rem; letter-spacing: 0.06em; } }
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

/** 칸 하나 — 납작한 유리 조각. 고르면 청록 테두리, 올리면 조금 더 하얘진다 */
export const DayCell = styled(C.DayCell)`
    border-right: none;
    border-radius: 10px;
    overflow: hidden; /* 둥근 칸 밖으로 막대·+N 이 비어져 나오지 않게 */
    background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.035)" : "rgba(255, 255, 255, 0.46)")};
    opacity: ${(p) => (p.$isCurrentMonth ? 1 : 0.45)};
    box-shadow: ${(p) => (p.$dropTarget
        ? `inset 0 0 0 2px ${p.theme.colors.primary}`
        : p.$isSelected
            ? `inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.75)}, 0 0 0 4px ${withAlpha(p.theme.colors.primary, 0.12)}`
            : "none")};
    transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.25s ${EASE};
    animation: ${tileIn} 0.5s ${EASE} both;
    ${CASCADE}
    ${calm}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) => (p.$isSelected
            ? `inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.75)}, 0 10px 22px -12px ${withAlpha(p.theme.colors.primary, 0.7)}`
            : `inset 0 0 0 1px ${dark(p) ? "rgba(160, 240, 230, 0.2)" : "rgba(255, 255, 255, 0.95)"}, 0 10px 22px -14px ${dark(p) ? "rgba(0, 0, 0, 0.7)" : "rgba(6, 60, 66, 0.45)"}`)};
        background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.82)")};
    }

    .day-header {
        padding: 5px 6px 1px;
        .day-number {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-size: 0.8rem;
            font-weight: ${(p) => (p.$isToday || p.$isSelected ? 700 : 500)};
            font-variant-numeric: tabular-nums;
            line-height: 20px;
            color: ${(p) => p.theme.colors.text};
            ${(p) => p.$isToday && css`
                --today-halo: ${withAlpha(p.theme.colors.primary, 0.35)};
                --today-glow: ${withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.5 : 0.6)};
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 22px;
                height: 22px;
                margin: -1px 0 -1px -2px;
                padding: 0 5px;
                border-radius: 11px;
                color: ${p.theme.mode === "dark" ? "#06110F" : "#FFFFFF"};
                background-color: ${p.theme.colors.primary};
                background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 65%);
                box-shadow: 0 4px 12px -2px var(--today-glow);
                animation: ${breathe} 3.6s ease-in-out infinite;
                ${calm}
            `}
        }
    }
    ${MOBILE} {
        border-radius: 8px;
        .day-header { padding: 3px 4px 0; .day-number { font-size: 0.74rem; line-height: 18px; } }
    }
`;

/** 오늘 원반(별 시계)은 바다에 없다 — 숫자 자체가 청록 동그라미가 된다 */
export const TodayDisc = styled(C.TodayDisc)`
    display: none;
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: none;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
    &:hover { transform: none; color: ${(p) => p.theme.colors.primary}; background: ${(p) => withAlpha(p.theme.colors.primary, 0.12)}; }
`;

export const TodoBarList = styled(C.TodoBarList)`
    margin-top: 3px;
    margin-bottom: 3px;
    gap: 2px;
    /* "+N" 꼬리표가 이 목록 위(날짜 줄)로 떠 있으므로 목록이 그것을 오려 내지 않게 — 칸(DayCell)이 대신 오린다 */
    ${NOT_WIDGET} & { @media (min-width: 769px) { overflow: visible; } }
`;

/**
 * 일정 막대 — 옅게 물든 면에 앞쪽 색 띠, 글씨는 진하게 (요즘 달력들의 문법). 여러 날이면 칸 사이 틈을 건너 잇는다.
 * 폰에서는 마름모(Celestial) 대신 작은 동그라미 점으로 늘어놓는다.
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    height: 18px;
    font-size: 0.7rem;
    font-weight: 500;
    background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.08 : dark(p) ? 0.24 : 0.15)};
    color: ${(p) => p.theme.colors.text};
    border-radius: ${(p) => `${p.$isStart ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isStart ? 5 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "4px" : `-${GAP}px`)};
    margin-right: ${(p) => (p.$isEnd ? "4px" : `-${GAP}px`)};
    box-shadow: ${(p) => (p.$isStart ? `inset 2.5px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    &:hover { background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, dark(p) ? 0.32 : 0.22)}; }
    .todo-title { padding-left: 7px; ${(p) => p.$isDone && css`text-decoration: line-through; opacity: 0.55;`} }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 6px;
            height: 6px;
            border: none;
            border-radius: 50%;
            transform: none;
            box-shadow: none;
            background: ${(p) => (p.$isDone ? withAlpha(p.$color ?? p.theme.colors.primary, 0.35) : p.$color ?? p.theme.colors.primary)};
        }
    }
`;

/**
 * "+N" — 막대 한 층을 차지하지 않고 날짜 줄 오른쪽에 뜬 작은 꼬리표.
 * 칸에 들어갈 층 수는 이 단추의 키를 빼고 셈한다(MonthCalendarView 의 fit) — 키를 0 으로 두어 그 몫을 막대에 돌려준다.
 * 위젯·폰은 칸이 좁아 날짜 줄에 둘 자리가 없으니 원래대로 아래에 둔다.
 */
export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin-left: 4px;
    padding: 1px 7px;
    border-radius: 6px;
    border: none;
    font-family: ${MONO};
    font-size: 0.64rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};

    ${NOT_WIDGET} & {
        @media (min-width: 769px) {
            position: absolute;
            top: -22px;
            right: 28px;
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
                padding: 0 6px;
                border-radius: 6px;
                line-height: 17px;
                color: ${(p) => p.theme.colors.textSecondary};
                background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
            }
            &:hover { background: none; .short { color: ${(p) => p.theme.colors.text}; background: ${(p) => ink(p.theme, dark(p) ? 0.16 : 0.1)}; } }
        }
    }
`;

export const CompactTaskCount = styled(C.CompactTaskCount)`
    border-radius: 6px;
    border: none;
    font-family: ${MONO};
    background: ${(p) => ink(p.theme, 0.08)};
    color: ${(p) => p.theme.colors.text};
`;

export const MoveNotice = styled(C.MoveNotice)`
    ${surface("float")}
    border-radius: ${R.md};
    margin-bottom: 8px;
    button { font-weight: 600; }
`;
