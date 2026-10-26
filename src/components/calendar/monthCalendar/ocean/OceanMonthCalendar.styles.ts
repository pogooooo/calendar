/**
 * 바다의 월간 — 칸마다 상자를 두지 않는다. 유리 한 장 위에 숫자가 떠 있고, 주와 주 사이에만 가는 빛줄(깎아 낸 듯한 두 겹 선)이 지난다.
 * (Celestial: 금빛 실선이 가로세로로 칸을 가두는 격자, Maple: 종이 원장)
 *   - 오늘은 숫자 옆에서 말려 올라오는 파도와 포말, 고른 날은 얇은 해안선으로 구분한다. 칸을 물이나 도형으로 채우지 않는다.
 *   - 일정 막대는 물방울 캡슐 — 옅게 물든 면, 시작에 방울 하나, 여러 날이면 칸을 건너 끊김 없이 이어진다
 *   - "+N" 은 날짜 줄 오른쪽의 작은 글씨 하나 (상자 없음)
 *   - 달을 넘기면 판이 밀려가고, 물마루가 지나는 쪽부터 칸이 차례로 살짝 출렁인다
 * 레퍼런스: 유리 위에 숫자만 띄운 글래스 달력들, Apple 달력의 가로줄만 있는 월간, Notion Calendar 의 옅은 면 막대.
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { surfDate } from '@/styles/ocean/calendarMarks';
import { MONO, R, focusRing, ink, seaButton, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/CelestialMonthCalendar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 깎아 낸 듯한 두 겹 줄 — 위는 옅은 그늘, 아래는 빛 (밤에는 물빛 한 줄) */
const etched = css`
    border-bottom: 1px solid ${(p) => (dark(p) ? "rgba(160, 240, 230, 0.09)" : "rgba(6, 60, 66, 0.085)")};
    box-shadow: 0 1px 0 ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.7)")};
`;

/** 달을 넘기면 물마루가 지나가는 쪽부터 칸이 차례로 살짝 들렸다 가라앉는다 — 내용은 그대로 보인다(투명도는 건드리지 않는다) */
const bob = keyframes`
    0%   { transform: none; }
    35%  { transform: translateY(-5px); }
    70%  { transform: translateY(1.5px); }
    100% { transform: none; }
`;

/** 막대에 마우스가 오면 물빛이 한 번 흘러간다 */
const shimmer = keyframes`
    from { background-position: 130% 0; }
    to   { background-position: -30% 0; }
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
    margin-bottom:0;
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
    && { border-radius:0; background:transparent; padding:2px 0; }
    border: none;
    ${etched}
    margin-bottom: 0;
    &::after { display: none; }
    [data-widget] & { border: none; box-shadow: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    && { height: 32px; }
    && .day-name { font-family: ${(p) => p.theme.fonts.body}; font-size: 0.73rem; font-weight: 650; letter-spacing: 0.04em; }
    ${MOBILE} { && { height: 28px; } && .day-name { font-size: 0.65rem; } }
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
    grid-template-rows: repeat(6, minmax(32px, 1fr));
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
 * 물빛 위의 날짜. 오늘은 숫자 밑의 빛줄, 선택은 칸 아래의 수평선으로 구분한다.
 */
export const DayCell = styled(C.DayCell)`
    && .day-header { height:36px; flex:0 0 36px; padding:5px 9px; }
    ${MOBILE} { && .day-header { height:28px; flex-basis:28px; padding:2px 4px; } }
    && { opacity: ${(p) => p.$isCurrentMonth ? 1 : 0.68}; border-right:1px solid ${(p) => withAlpha(p.theme.colors.primary, .08)}; border-bottom:0; }
    && .day-header .day-number { font-family:${(p) => p.theme.fonts.body}; font-size:.88rem; font-weight:${p => p.$isToday || p.$isSelected ? 700 : 500}; font-variant-numeric:tabular-nums; }
    ${(p) => p.$isToday && css`
        && .day-header .day-number {
            ${surfDate}
            color:${p.theme.colors.text}; font-size:.95rem; font-weight:800; line-height:22px;
            &::after {
                content:""; display:block; position:absolute; left:1px; right:1px; bottom:0; height:2px;
                background:linear-gradient(90deg,${p.theme.colors.primary},${p.theme.colors.accent});
                box-shadow:0 2px 5px ${withAlpha(p.theme.colors.primary,.18)};
            }
        }
    `}
    ${MOBILE} { && .day-header .day-number { font-size:${p => p.$isToday ? '.86rem' : '.78rem'}; line-height:20px; } }
    border-right: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    /* 날짜 전환은 기존 물결 움직임을 유지한다. */
    :where(html:not([data-theme-motion="off"])) [data-entering] & { animation: ${bob} 0.8s cubic-bezier(0.3, 0.6, 0.3, 1) both; }
    :where(html:not([data-theme-motion="off"])) [data-entering][data-dir="next"] & { animation-delay: calc((6 - var(--col, 0)) * 55ms + 160ms); }
    :where(html:not([data-theme-motion="off"])) [data-entering][data-dir="prev"] & { animation-delay: calc(var(--col, 0) * 55ms + 160ms); }
    [data-widget] & { animation: none; }

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: 0;
        pointer-events: none;
        transition: background-color 0.2s ease, box-shadow 0.2s ease;
        ${(p) => (p.$dropTarget
            ? css`box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}; background: ${withAlpha(p.theme.colors.primary, 0.12)};`
            : p.$isSelected
                ? css`
                    background: linear-gradient(180deg,transparent,${withAlpha(p.theme.colors.primary, .075)});
                    box-shadow: inset 0 -2px 0 ${withAlpha(p.theme.colors.primary, .65)};
                `
                : css``)}
    }
    &::after { display:none; }

    &:hover { box-shadow: none; }
    &:hover::before {
        ${(p) => !p.$isSelected && !p.$dropTarget && css`background: ${withAlpha(p.theme.colors.primary, .045)};`}
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
        }
    }
    ${MOBILE} {
        .day-header { padding: 4px 4px 0; .day-number { font-size: 0.74rem; line-height: 18px; } }
    }
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    top: 7px;
    right: 7px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: none;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => withAlpha(p.theme.colors.primary,.06)};
    &:hover { transform: none; color: ${(p) => p.theme.colors.primary}; background: ${(p) => withAlpha(p.theme.colors.primary,.12)}; }
`;

export const TodoBarList = styled(C.TodoBarList)`
    margin-top: 3px;
    margin-bottom: 4px;
    gap: 2px;
    /* 표시 개수는 기존 높이 측정을 따른다. */
    ${NOT_WIDGET} & { @media (min-width: 769px) { overflow: visible; } }
`;

/**
 * 일정 막대 — 옅게 물든 면에 앞쪽 색 띠, 글씨는 진하게. 여러 날이면 칸을 건너 끊김 없이 이어진다 (칸 사이 틈이 없으니).
 * 폰에서는 마름모(Celestial) 대신 작은 동그라미 점으로 늘어놓는다.
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    @media (min-width: 769px) {
        && { height: 20px; font-size: 0.75rem; color: ${(p) => p.theme.colors.text}; background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.primary} ${dark(p) ? 24 : 16}%, ${p.theme.colors.background})`}; }
        && .todo-title { font-weight: 550; }
    }
    &&::after { background-image: linear-gradient(100deg, transparent 35%, ${(p) => dark(p) ? "rgba(190,255,245,0.18)" : "rgba(225,241,230,0.24)"} 50%, transparent 65%); }
    border: none;
    height: 18px;
    font-size: 0.7rem;
    font-weight: 500;
    /* 물방울 캡슐 — 물든 면 위에 윗가장자리의 윤, 아래 가장자리의 깊이. 끝은 둥글게(여러 날이면 시작·끝만) */
    background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.08 : dark(p) ? 0.24 : 0.16)};
    background-image: linear-gradient(180deg, ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.16)")} 0%, rgba(255, 255, 255, 0) 58%);
    color: ${(p) => p.theme.colors.text};
    border-radius: ${(p) => `${p.$isStart ? 4 : 0}px ${p.$isEnd ? 4 : 0}px ${p.$isEnd ? 4 : 0}px ${p.$isStart ? 4 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "6px" : "0")};
    margin-right: ${(p) => (p.$isEnd ? "6px" : "0")};
    box-shadow: inset 0 -1px 0 ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, dark(p) ? 0.3 : 0.22)};
    overflow: hidden;
    &:hover { background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, dark(p) ? 0.32 : 0.24)}; }
    .todo-title { padding-left: ${(p) => (p.$isStart ? 11 : 7)}px; ${(p) => p.$isDone && css`text-decoration: line-through; opacity:1;`} }

    /* 시작 칸의 가는 색 표식 — 물빛은 막대의 윤으로만 표현한다. */
    ${(p) => p.$isStart && css`
        &::before {
            content: "";
            position: absolute;
            left: 4px;
            top: 50%;
            width: 2px;
            height: 10px;
            margin-top: -5px;
            border-radius: 1px;
            background: ${p.$color ?? p.theme.colors.primary};
            pointer-events: none;
        }
    `}
    /* 마우스가 오면 물빛이 한 번 흘러간다 */
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background: linear-gradient(100deg, transparent 35%, ${(p) => (dark(p) ? "rgba(190, 255, 245, 0.22)" : "rgba(255, 255, 255, 0.75)")} 50%, transparent 65%) 130% 0 / 260% 100% no-repeat;
        opacity: 0;
    }
    :where(html:not([data-theme-motion="off"])) &:hover::after { opacity: 1; animation: ${shimmer} 0.9s ease-out both; }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 6px;
            height: 6px;
            margin: 0;
            border: none;
            border-radius: 50%;
            transform: none;
            box-shadow: none;
            /* 물방울 — 빛 한 점이 맺힌 작은 방울 */
            width: 7px;
            height: 7px;
            background: ${(p) => `radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.9) 0 20%, ${p.$isDone ? withAlpha(p.$color ?? p.theme.colors.primary, 0.35) : p.$color ?? p.theme.colors.primary} 62%)`};
            &::before, &::after { display: none; }
        }
    }
`;

/**
 * "+N" occupies its own measured row below events so it cannot cover an anniversary caption.
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
            position:static;
            align-self:flex-end;
            height:18px;
            min-height:18px;
            padding:0 4px;
            margin:0;
            background: none;
            overflow: visible;
            .full { display: none; }
            .short {
                display: inline-block;
                transform:none;
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
