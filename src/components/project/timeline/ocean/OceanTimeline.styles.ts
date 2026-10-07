/**
 * 바다의 프로젝트 타임라인 — 금빛 점선 칸에 각진 막대(Celestial), 먹 하이라인에 마스킹테이프(Maple) 대신
 * **반투명 판 하나에 머리카락 선 격자**. 머리 줄에 [제목 | 잇는 법 안내], 그 아래 날짜 줄은 고정폭 숫자,
 * 주말 칸은 아주 옅게 칠하고, 오늘은 청록으로 꽉 찬 작은 날짜 꼬리표와 그 아래로 내려가는 1.5px 청록 선.
 *
 *   작업 막대 = 6px 모서리의 납작한 면: 진행 전은 옅은 먹 + 선, 진행 중은 청록에 흰 글씨, 끝낸 일은 옅은 청록에 줄.
 *   선행 관계 = 가는 회색 곡선(움직이지 않는다). 잇기 고리는 막대에 올렸을 때만 작은 동그라미로.
 * 폰은 날짜 순 목록 — 머리카락 선으로 가른 줄, 앞에 상태 점.
 */
import styled, { css, type DefaultTheme } from "styled-components";
import * as C from "../celestial/CelestialTimeline.styles";
import { EASE, MONO, R, calm, focusRing, hairline, ink, surface, surfaceIn, sunBeam } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, TOUCH } from "@/styles/breakpoints";
import { SectionTitle as OceanSectionTitle, statusDot } from "@/components/project/ocean/section";

export * from "../celestial/CelestialTimeline.styles";

const DESKTOP = "@media (min-width: 769px)";
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const onTeal = (t: DefaultTheme) => (t.mode === "dark" ? "#06110F" : "#FFFFFF");

/* ── 판 ─────────────────────────────────────────────────────────────── */

/** 반투명 판. 데스크톱에서는 화면 격자의 "sea" 자리에 앉고, 위 줄에 [제목 | 안내], 아래에 표 */
export const SectionWrapper = styled(C.SectionWrapper)`
    ${surface("panel")}
    border-radius: ${R.lg};

    ${DESKTOP} {
        grid-area: sea;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
        animation: ${surfaceIn} 0.45s 0.04s ${EASE} both;
        ${calm}
    }

    ${MOBILE} {
        animation: ${surfaceIn} 0.45s 0.06s ${EASE} both;
        ${calm}
    }
`;

export const SectionTitle = styled(OceanSectionTitle)`
    ${DESKTOP} { grid-column: 1; grid-row: 1; }
`;

/** 잇는 법 안내 — 데스크톱은 제목 줄 오른쪽에 작게, 폰은 제목 아래 */
export const LinkHint = styled(C.LinkHint)`
    min-height: 0;
    padding: 0 16px 10px;
    font-size: 0.75rem;
    color: ${(p) => p.theme.colors.textSecondary};

    ${DESKTOP} {
        grid-column: 2;
        grid-row: 1;
        align-self: center;
        justify-self: end;
        max-width: 100%;
        padding: 6px 18px 0 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

/** 표 — 판 안에 꽉 차게, 위로 머리카락 선 하나 */
export const TimelineLayout = styled(C.TimelineLayout)`
    grid-column: 1 / -1;
    grid-row: 2;
    min-height: 0;
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;

export const TimelineGridArea = styled(C.TimelineGridArea)`
    scrollbar-width: thin;
    scrollbar-color: ${(p) => ink(p.theme, 0.18)} transparent;
`;

/** 날짜 줄 — 판 빛깔의 띠(위로 굴러가는 막대가 비치지 않게), 아래로 머리카락 선 */
export const TimelineDateHeader = styled(C.TimelineDateHeader)`
    height: 34px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    background: ${(p) => (dark(p) ? "rgba(21, 31, 32, 0.94)" : "rgba(246, 249, 248, 0.94)")};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
`;

const weekendFill = (p: { theme: DefaultTheme }) => ink(p.theme, dark(p) ? 0.05 : 0.03);

export const DateCell = styled(C.DateCell)`
    border-right: none;
    background-color: transparent;
    &[data-weekend] { background-color: ${weekendFill}; }
`;

/** 날짜 숫자 — 고정폭 꼬리표 글씨. 오늘은 청록으로 꽉 찬 작은 꼬리표 */
export const DateNumber = styled(C.DateNumber)`
    font-family: ${MONO};
    font-size: 0.68rem;
    font-weight: ${(p) => (p.$isToday ? 600 : 500)};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
    color: ${(p) => (p.$isToday ? onTeal(p.theme) : p.theme.colors.textSecondary)};
    filter: none;

    ${(p) => p.$isToday && css`
        min-width: 22px;
        padding: 2px 6px;
        border-radius: ${R.pill};
        text-align: center;
        background: ${p.theme.colors.primary};
    `}
`;

/** 날 한 칸 — 오른쪽에 머리카락 선, 주말은 아주 옅은 칠, 오늘 칸 가운데로 1.5px 청록 선 */
export const TimelineVerticalLine = styled(C.TimelineVerticalLine)`
    position: relative;
    border-right: 1px solid ${(p) => hairline(p.theme)};
    background-color: transparent;
    &[data-weekend] { background-color: ${weekendFill}; }

    ${(p) => p.$isToday && css`
        &::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 4px;
            margin-left: -2px;
            ${sunBeam()}
        }
    `}
`;

export const TimelineGraphContainer = styled(C.TimelineGraphContainer)`
    &[data-connecting] { cursor: crosshair; }
`;

/* ── 선행 관계 ───────────────────────────────────────────────────────── */

/** 화살촉도 같은 색 (currentColor) */
export const DependencySvg = styled(C.DependencySvg)`
    color: ${(p) => ink(p.theme, dark(p) ? 0.45 : 0.38)};
`;

/** 가는 회색 곡선 — 움직이지 않는다. 끌고 있는 임시 선만 청록 점선 */
export const DependencyLine = styled(C.DependencyLine)`
    stroke: currentColor;
    stroke-width: 1.25;
    opacity: 1;

    &[stroke-dasharray] { stroke: ${(p) => p.theme.colors.primary}; stroke-width: 1.5; }
`;

/* ── 작업 막대: 납작한 면 ─────────────────────────────────────────────── */

/**
 * 상태마다 면 — 진행 전 옅은 먹(8%), 진행 중 청록(85%), 끝낸 일 옅은 청록(25%).
 * 판 빛깔에 섞어 불투명하게 칠한다 — 비치면 오늘 선과 칸 선이 막대 위로 지나가 보인다.
 */
const PANEL_TONE = { light: "#F2F7F6", dark: "#111A1B" };
const mixed = (t: DefaultTheme, color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, ${PANEL_TONE[t.mode]})`;
const fill = (p: { theme: DefaultTheme; $status?: string }, hover = false) => {
    const c = p.theme.colors;
    if (p.$status === "in_progress") return hover ? c.primary : mixed(p.theme, c.primary, 85);
    if (p.$status === "done") return mixed(p.theme, c.primary, hover ? 32 : 25);
    return mixed(p.theme, c.text, (dark(p) ? 12 : 8) + (hover ? 4 : 0));
};
const fillInk = (p: { theme: DefaultTheme; $status?: string }) => (p.$status === "in_progress" ? onTeal(p.theme) : p.theme.colors.text);

export const TaskNode = styled(C.TaskNode)`
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.$status === "todo" || !p.$status ? hairline(p.theme, true) : "transparent")};
    background: ${(p) => fill(p)};
    color: ${fillInk};
    font-family: ${(p) => p.theme.fonts.body};
    text-decoration: ${(p) => (p.$status === "done" ? "line-through" : "none")};
    text-decoration-color: ${(p) => ink(p.theme, 0.4)};
    outline: ${(p) => (p.$connectTarget ? `2px solid ${withAlpha(p.theme.colors.primary, 0.6)}` : "none")};
    outline-offset: 2px;
    opacity: ${(p) => (p.$isDragging ? 0.95 : 1)};
    box-shadow: ${(p) => (p.$isDragging ? `0 10px 24px -8px ${dark(p) ? "rgba(0, 0, 0, 0.6)" : "rgba(18, 33, 32, 0.35)"}` : "none")};
    transition: ${(p) => (p.$isDragging ? "none" : "background-color 0.15s ease, border-color 0.15s ease")};

    &:hover {
        background: ${(p) => fill(p, true)};
        color: ${fillInk};
        text-decoration: ${(p) => (p.$status === "done" ? "line-through" : "none")};
    }

    ${focusRing}
`;

export const TaskNodeText = styled(C.TaskNodeText)`
    font-size: 0.75rem;
    font-weight: 500;
`;

/** 오른쪽 끝 늘리기 — 올리면 옅게 비친다 */
export const TaskResizeHandle = styled(C.TaskResizeHandle)`
    border-radius: 0 6px 6px 0;
    &:hover { background-color: ${(p) => ink(p.theme, 0.12)}; }
`;

/** 잇기 고리 — 막대에 올렸을 때만 보이는 작은 무채색 동그라미. 고르면 청록 */
export const Connector = styled(C.Connector)`
    right: -24px;
    width: 18px;
    height: 18px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    background: ${(p) => (dark(p) ? "#1B2526" : "#FFFFFF")};
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;

    svg { width: 11px; height: 11px; }

    ${TaskNode}:hover &, ${TaskNode}:focus-within &, &[aria-pressed="true"] { opacity: 1; }
    ${TOUCH} { opacity: 1; }

    &:hover { box-shadow: none; color: ${(p) => p.theme.colors.text}; border-color: ${(p) => ink(p.theme, 0.25)}; }
    &[aria-pressed="true"] {
        color: ${(p) => onTeal(p.theme)};
        background: ${(p) => p.theme.colors.primary};
        border-color: transparent;
    }
    ${focusRing}
`;

/* ── 폰: 날짜 순 목록 ───────────────────────────────────────────────── */

export const AgendaList = styled(C.AgendaList)`
    padding: 0 8px 8px;
    scrollbar-width: thin;
    scrollbar-color: ${(p) => ink(p.theme, 0.18)} transparent;
`;

/** 한 줄 — 아래로 머리카락 선 */
export const MobileTaskRow = styled(C.MobileTaskRow)`
    gap: 4px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    &:last-child { border-bottom: none; }
`;

export const AgendaRow = styled(C.AgendaRow)`
    gap: 12px;
    min-height: 48px;
    padding: 6px 8px;
    border: none;
    border-radius: ${R.sm};
    font-family: ${(p) => p.theme.fonts.body};
    transition: background-color 0.15s ease;

    &::before { content: ""; ${(p) => statusDot(p.$status)} }
    &:active { background: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)}; }
`;

export const AgendaWhen = styled(C.AgendaWhen)`
    min-width: 4.4em;

    b { font-size: 0.75rem; font-weight: 600; color: ${(p) => p.theme.colors.text}; }
    em { font-size: 0.7rem; color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const AgendaTitle = styled(C.AgendaTitle)`
    font-size: 0.845rem;
    text-decoration-color: ${(p) => ink(p.theme, 0.35)};
`;

export const AgendaEmpty = styled(C.AgendaEmpty)`
    font-size: 0.8rem;
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 1;
`;

/** 폰의 잇기 단추 — 선 하나 두른 10px 모서리 (40px, 손가락 자리) */
export const MobileConnector = styled(C.MobileConnector)`
    border-radius: 10px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    background: transparent;
    color: ${(p) => p.theme.colors.textSecondary};

    &[aria-pressed="true"] {
        color: ${(p) => onTeal(p.theme)};
        background: ${(p) => p.theme.colors.primary};
        border-color: transparent;
    }
    ${focusRing}
`;
