/**
 * 바다의 월간 — 칸마다 상자를 두지 않는다. 유리 한 장 위에 숫자가 떠 있고, 주와 주 사이에만 가는 빛줄(깎아 낸 듯한 두 겹 선)이 지난다.
 * (Celestial: 금빛 실선이 가로세로로 칸을 가두는 격자, Maple: 종이 원장)
 *   - 고른 날·올린 날은 칸 안쪽에 둥근 빛 판이 고이고, 오늘은 숫자가 빛을 머금은 청록 동그라미가 되어 천천히 숨 쉰다
 *   - 일정 막대는 옅게 물든 면에 앞쪽 색 띠, 여러 날이면 칸을 건너 끊김 없이 이어진다
 *   - "+N" 은 날짜 줄 오른쪽의 작은 글씨 하나 (상자 없음)
 *   - 달을 넘기면 칸들이 왼쪽 위에서 오른쪽 아래로 물결처럼 차례로 떠오른다
 * 레퍼런스: 유리 위에 숫자만 띄운 글래스 달력들, Apple 달력의 가로줄만 있는 월간, Notion Calendar 의 옅은 면 막대.
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { MONO, R, calm, focusRing, ink, seaButton, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/CelestialMonthCalendar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 깎아 낸 듯한 두 겹 줄 — 위는 옅은 그늘, 아래는 빛 (밤에는 물빛 한 줄) */
const etched = css`
    border-bottom: 1px solid ${(p) => (dark(p) ? "rgba(160, 240, 230, 0.09)" : "rgba(6, 60, 66, 0.085)")};
    box-shadow: 0 1px 0 ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.7)")};
`;

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
    &:disabled { opacity: 0.4; }
`;

/** 요일 머리 — 상자 없이 작은 고정폭 대문자, 아래로 빛줄 하나 */
export const Header = styled(C.Header)`
    border: none;
    ${etched}
    margin-bottom: 0;
    &::after { display: none; }
    [data-widget] & { border: none; box-shadow: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    border: none !important;
    height: 30px;
    justify-content: flex-start;
    padding-left: 10px;
    .day-name {
        font-family: ${MONO};
        font-size: 0.64rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    &:first-child .day-name { color: ${(p) => p.theme.colors.weekend}; }
    ${MOBILE} { height: 24px; justify-content: center; padding-left: 0; .day-name { font-size: 0.58rem; letter-spacing: 0.06em; } }
`;

export const GridContainer = styled(C.GridContainer)`
    border: none;
    gap: 0;
    grid-template-rows: repeat(6, minmax(52px, 1fr));
`;

/** 주 한 줄 — 칸 사이에는 아무것도 없고, 줄 아래로 빛줄 하나 */
export const WeekRowContainer = styled(C.WeekRowContainer)`
    border-bottom: none;
    gap: 0;
    min-height: 0;
    ${etched}
    &:last-child { border-bottom: none; box-shadow: none; }
    [data-widget] & { border-bottom: none; box-shadow: none; }
`;

/**
 * 칸 하나 — 상자 없음. 올리거나 고르면 칸 안쪽(사방 3px 안)에 둥근 빛 판이 고인다(::before).
 * 오늘 칸은 숫자 둘레로 청록 빛이 옅게 번진다.
 */
export const DayCell = styled(C.DayCell)`
    border-right: none;
    border-radius: 0;
    background: transparent;
    opacity: ${(p) => (p.$isCurrentMonth ? 1 : 0.4)};
    box-shadow: none;
    /* 칸은 제자리에서 나타나지 않는다 — 달을 넘기면 판 전체가 옆으로 밀려 들어온다(tideMotion, SwapLayer).
       예전의 칸마다 떠오르는 등장은 넘길 때마다 막대가 흐려졌다 차례로 떠올라 미끄럼이 아니라 깜빡임으로 보였다 */

    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        z-index: 0;
        border-radius: 10px;
        pointer-events: none;
        transition: background-color 0.2s ease, box-shadow 0.2s ease;
        ${(p) => (p.$dropTarget
            ? css`box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}; background: ${withAlpha(p.theme.colors.primary, 0.08)};`
            : p.$isSelected
                ? css`
                    background: ${dark(p) ? "rgba(160, 240, 230, 0.08)" : "rgba(255, 255, 255, 0.62)"};
                    box-shadow: inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.7)}, 0 6px 18px -10px ${withAlpha(p.theme.colors.primary, 0.6)};
                `
                : p.$isToday
                    ? css`background: radial-gradient(140px circle at 20px 16px, ${withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.12)}, transparent 70%);`
                    : css``)}
    }
    &:hover { box-shadow: none; }
    &:hover::before {
        background: ${(p) => (p.$isSelected ? undefined : dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.5)")};
        ${(p) => !p.$isSelected && css`box-shadow: inset 0 1px 0 ${dark(p) ? "rgba(180, 250, 240, 0.08)" : "#FFFFFF"}, 0 4px 14px -8px ${dark(p) ? "rgba(0, 0, 0, 0.6)" : "rgba(6, 60, 66, 0.35)"};`}
    }

    .day-header {
        padding: 7px 9px 1px;
        .day-number {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-size: 0.82rem;
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
                min-width: 24px;
                height: 24px;
                margin: -2px 0 -2px -4px;
                padding: 0 6px;
                border-radius: 12px;
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
        &::before { inset: 2px; border-radius: 8px; }
        .day-header { padding: 4px 4px 0; .day-number { font-size: 0.74rem; line-height: 18px; } }
    }
`;

/** 오늘 원반(별 시계)은 바다에 없다 — 숫자 자체가 청록 동그라미가 된다 */
export const TodayDisc = styled(C.TodayDisc)`
    display: none;
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    top: 7px;
    right: 7px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: none;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.7)")};
    &:hover { transform: none; color: ${(p) => p.theme.colors.primary}; background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.14)" : "#FFFFFF")}; }
`;

export const TodoBarList = styled(C.TodoBarList)`
    margin-top: 3px;
    margin-bottom: 4px;
    gap: 2px;
    /* "+N" 글씨가 이 목록 위(날짜 줄)로 떠 있으므로 목록이 그것을 오려 내지 않게 — 칸(DayCell)이 대신 오린다 */
    ${NOT_WIDGET} & { @media (min-width: 769px) { overflow: visible; } }
`;

/**
 * 일정 막대 — 옅게 물든 면에 앞쪽 색 띠, 글씨는 진하게. 여러 날이면 칸을 건너 끊김 없이 이어진다 (칸 사이 틈이 없으니).
 * 폰에서는 마름모(Celestial) 대신 작은 동그라미 점으로 늘어놓는다.
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    height: 18px;
    font-size: 0.7rem;
    font-weight: 500;
    background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.08 : dark(p) ? 0.22 : 0.14)};
    color: ${(p) => p.theme.colors.text};
    border-radius: ${(p) => `${p.$isStart ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isStart ? 5 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "6px" : "0")};
    margin-right: ${(p) => (p.$isEnd ? "6px" : "0")};
    box-shadow: ${(p) => (p.$isStart ? `inset 2.5px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    &:hover { background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, dark(p) ? 0.3 : 0.22)}; }
    .todo-title { padding-left: 7px; ${(p) => p.$isDone && css`text-decoration: line-through; opacity: 0.55;`} }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 6px;
            height: 6px;
            margin: 0;
            border: none;
            border-radius: 50%;
            transform: none;
            box-shadow: none;
            background: ${(p) => (p.$isDone ? withAlpha(p.$color ?? p.theme.colors.primary, 0.35) : p.$color ?? p.theme.colors.primary)};
        }
    }
`;

/**
 * "+N" — 막대 한 층을 차지하지 않고 날짜 줄 오른쪽에 뜬 작은 글씨.
 * 칸에 들어갈 층 수는 이 단추의 키를 빼고 셈한다(MonthCalendarView 의 fit) — 키를 0 으로 두어 그 몫을 막대에 돌려준다.
 * 위젯·폰은 칸이 좁아 날짜 줄에 둘 자리가 없으니 원래대로 아래에 둔다.
 */
export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 6px;
    border: none;
    font-family: ${MONO};
    font-size: 0.64rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.textSecondary};
    background: transparent;

    ${NOT_WIDGET} & {
        @media (min-width: 769px) {
            position: absolute;
            top: -22px;
            right: 30px;
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
                padding: 0 4px;
                border-radius: 5px;
                line-height: 17px;
                color: ${(p) => p.theme.colors.textSecondary};
            }
            &:hover { background: none; .short { color: ${(p) => p.theme.colors.primary}; background: ${(p) => withAlpha(p.theme.colors.primary, 0.1)}; } }
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
