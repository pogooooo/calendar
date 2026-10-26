/**
 * 바다의 주간 달력(위젯) — 금빛 상자 일곱 칸·모서리 사선·반짝이는 별(Celestial), 먹 표·테이프(Maple) 대신
 * 페이지 물빛 위에 얇은 구분선으로 나뉜 일곱 날. 오늘은 요일의 청록 밑선과 칸 아래의 강조선으로 구분한다.
 * 일정 막대는 옅게 물든 면에 앞쪽 색 띠, 날짜 사이 선은 머리카락 선 하나.
 * 위젯 창이라 끝없는 움직임은 하나도 없다 — Celestial 의 반짝이는 별 티끌(CalendarAmbience)도 감춘다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialWeekCalendar.styles";
import { MONO, focusRing, hairline, ink, label } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialWeekCalendar.styles";

const GAP = 4;
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
`;

/** 2026.10.04 – 2026.10.10 — 굵은 숫자 한 줄, 사이 선은 머리카락 선 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    gap: 8px;
    margin-bottom: 8px;

    & > hr { border-top-color: ${(p) => hairline(p.theme)}; }
`;

/** 날짜 옆 선 — 구슬·별 없이 머리카락 선 하나 */
export const DateLine = styled(C.DateLine)`
    height: 1px;
    background-color: ${(p) => hairline(p.theme)};
    &::before, &::after { display: none; animation: none; }
`;

/** 앞·뒤 — 긴 화살 대신 28px 글씨 단추 (꺾쇠는 바다의 Arrow 가 그린다 — 80px 자리를 받아도 이 칸에 맞게 줄어든다) */
export const ArrowWrapper = styled(C.ArrowWrapper)`
    width: 28px;
    height: 28px;
    justify-content: center;
    overflow: hidden;
    border-radius: 8px;
    transition: background-color 0.15s ease;

    & > * { flex: 0 1 auto; min-width: 0; }
    svg { width: 18px; height: 18px; }

    &:hover {
        filter: none;
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)};
    }
`;

/** 칸들의 창 — 빛무리 자리(음수 여백)를 걷고, 별 티끌은 감춘다 */
export const CalendarWindow = styled(C.CalendarWindow)`
    width: 100%;
    margin: 0;
    padding: 0;

    [data-widget] & { height: 100%; }
    && .mote { display: none; animation: none; }
`;

/** 요일 머리 — 상자·사선 없이 글씨만 */
export const Header = styled(C.Header)`
    border: none;
    gap: ${GAP}px;
    margin-bottom: 2px;
    &::before, &::after { display: none; }
`;

/** 요일 — 작은 고정폭 대문자. 일요일은 산호, 오늘은 청록 꼬리표 */
export const DayNameBox = styled(C.DayNameBox)`
    && { height:40px; background:transparent; border-bottom:1px solid ${(p) => hairline(p.theme)}; border-radius:0; }
    && .day-name { font-family: ${(p) => p.theme.fonts.body}; font-size: 0.73rem; letter-spacing: 0.03em; font-weight: 650; }
    height: 26px;
    border-right: none;

    .day-name {
        ${label}
        font-size: 0.64rem;
        line-height: 1;
    }
    &:first-child .day-name { color: ${(p) => p.theme.colors.weekend}; }

    /* 챌린지를 해낸 날 — 선·마름모 대신 요일 옆 작은 점 (반 넘게: 먹, 다: 청록) */
    .day-mark, .day-mark.done {
        top: 50%;
        bottom: auto;
        left: auto;
        right: 8px;
        width: 5px;
        height: 5px;
        margin-top: -2.5px;
        transform: none;
        border-radius: 50%;
        box-shadow: none;
        background-color: ${(p) => ink(p.theme, 0.3)};
    }
    .day-mark.done { background-color: ${(p) => p.theme.colors.primary}; }
    .day-mark.done::before, .day-mark.done::after { display: none; }

    ${(p) => p.$isToday && css`
        &::before { display: none; }
        && .day-name { color:${p.theme.colors.primary}; font-weight:750; text-decoration:underline; text-decoration-thickness:1.5px; text-underline-offset:6px; text-decoration-skip-ink:none; }
        &&:first-child .day-name { color:${p.theme.colors.primary}; }
    `}
`;

export const BarContainer = styled(C.BarContainer)`
    border: none;
    gap: ${GAP}px;
    &::before, &::after { display: none; }
`;

/** 날 한 칸 — 바탕은 투명하게 이어지고 오늘만 아래에 청록 선을 남긴다. */
export const DaySlot = styled(C.DaySlot)`
    && { border-radius:0; background-color:transparent; border:0; border-right:1px solid ${(p) => hairline(p.theme)}; box-shadow:${(p) => p.$isToday ? `inset 0 -2px 0 ${withAlpha(p.theme.colors.primary, .65)}` : 'none'}; }
    &&:hover { background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.1 : 0.07)}; }
    border: none;
    border-radius: 10px;
    background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.035)" : "rgba(255, 255, 255, 0.46)")};
    box-shadow: ${(p) => (p.$isToday ? `inset 0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.7)}` : `inset 0 0 0 1px ${hairline(p.theme)}`)};
    transition: background-color 0.15s ease;

    &:last-child { border-right: none; }
    &:hover { background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.85)")}; }
    &:hover .add-btn { opacity: 1; }
`;

/** + — 작은 옅은 칸 */
export const AddTodoButton = styled(C.AddTodoButton)`
    top: 5px;
    left: auto;
    right: 5px;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 6px;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;

    &:hover { transform: none; color: ${(p) => p.theme.colors.primary}; background: ${(p) => withAlpha(p.theme.colors.primary, 0.12)}; }
    ${focusRing}
    svg { width: 13px; height: 13px; }
`;

/** 위젯 칸은 낮아서 위 여백을 줄인다 — + 는 올렸을 때만 첫 막대 오른쪽 끝에 뜬다 */
export const TodoBarList = styled(C.TodoBarList)`
    margin-top: 8px;
    gap: 3px;
`;

/** 일정 막대 — 옅게 물든 면에 앞쪽 색 띠. 여러 날이면 칸 사이 틈을 건너 잇는다 */
export const TodoBarItem = styled(C.TodoBarItem)`
    && { font-size: 0.74rem; font-weight: 550; background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.primary} ${dark(p) ? 24 : 15}%, ${p.theme.colors.surface})`}; }
    border: none;
    height: 20px;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.text};
    background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, p.$isDone ? 0.08 : dark(p) ? 0.24 : 0.15)};
    border-radius: ${(p) => `${p.$isStart ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isStart ? 5 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "4px" : `-${GAP}px`)};
    margin-right: ${(p) => (p.$isEnd ? "4px" : `-${GAP}px`)};
    box-shadow: ${(p) => (p.$isStart ? `inset 2.5px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    clip-path: none;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => withAlpha(p.$color ?? p.theme.colors.primary, dark(p) ? 0.32 : 0.22)}; }

    .todo-title { padding-left: 7px; }
    ${(p) => p.$isDone && css`
        .todo-title { text-decoration: line-through; opacity: 1; color:${p.theme.colors.textSecondary}; }
    `}
`;

/** 빈 층 — 막대와 같은 키 */
export const TodoBarSpacer = styled(C.TodoBarSpacer)`
    height: 20px;
`;

export const TodayIndicator = styled(C.TodayIndicator)`
    display: none;
`;

/** +N — 작은 고정폭 꼬리표 */
export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin: 2px 0 0 4px;
    padding: 1px 7px;
    border-radius: 6px;
    font-family: ${MONO};
    font-size: 0.64rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};

    &:hover { text-shadow: none; color: ${(p) => p.theme.colors.text}; background: ${(p) => ink(p.theme, dark(p) ? 0.16 : 0.1)}; }
`;
