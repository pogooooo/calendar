/**
 * Maple 의 프로젝트 타임라인 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 카드 안의 아주 옅은 실선 격자(주말 칸은 한 겹 더 옅게 물들고), 오늘은 옅은 붉은 칸에 가는 붉은 선과
 * 붉은 알약 날짜. 막대는 둥근 모서리에 상태 빛깔(진행 전 호박빛 · 진행 중 단풍 붉음 · 완료는 옅은 밤색)을 옅게 깔고
 * 왼쪽에 3px 띠 — 보드 칸 머리의 점과 같은 빛깔이다. 짧은 막대의 이름은 막대 밖에 쓴다(잘리지 않게).
 * 예전의 점선 격자·마스킹테이프 막대·Cormorant 작은 숫자는 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialTimeline.styles";
import { hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialTimeline.styles";
export { SectionWrapper, SectionTitle } from "@/components/project/maple/section";

type Themed = { theme: { mode: string; colors: { primary: string; accent: string; success: string; text: string; textSecondary: string; surface: string } } };
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 상태의 빛깔 — 보드 칸 머리의 점과 같은 말 */
const statusColor = (p: Themed, status?: string) => (status === "done"
    ? p.theme.colors.success
    : status === "in_progress" ? p.theme.colors.primary : p.theme.colors.accent);

/**
 * 카드 안의 굴림 막대 — 앱 전체의 눈금자 막대는 카드 안에서 무거워 가는 막대 하나로.
 * 마우스 화면에서만: 손가락 화면에 이 속성을 주면 겹쳐 뜨던 막대가 자리를 차지하는 막대로 바뀐다(GlobalScrollbar 와 같은 까닭)
 */
const thinScroll = css`
    @media (hover: hover) {
        scrollbar-width: thin;
        scrollbar-color: ${(p) => hair(p.theme, 0.22)} transparent;
    }
`;

/** 오늘 칸의 옅은 붉음 */
const todayTint = (p: Themed) => withAlpha(p.theme.colors.primary, dark(p) ? 0.12 : 0.07);
/** 주말 칸 — 한 겹 더 옅게 */
const weekendTint = (p: Themed) => hair(p.theme, dark(p) ? 0.035 : 0.025);

export const LinkHint = styled(C.LinkHint)`
    min-height: 0;
    padding: 0 16px 10px;
    font-size: 12px;
    line-height: 1.5;
`;

export const TimelineLayout = styled(C.TimelineLayout)`
    border-top: 1px solid ${(p) => hair(p.theme, 0.08)};
`;

export const TimelineGridArea = styled(C.TimelineGridArea)`
    ${thinScroll}
`;

/** 날짜 머리 — 카드와 같은 바탕에 옅은 밑줄 (굴려도 위에 붙어 있다) */
export const TimelineDateHeader = styled(C.TimelineDateHeader)`
    height: 38px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.1)};
    background: ${(p) => p.theme.colors.surface};
`;

export const DateCell = styled(C.DateCell)`
    border-right: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.07 : 0.06)};
    background-color: ${(p) => (p.$isToday ? todayTint(p) : "transparent")};

    &[data-weekend] { background-color: ${(p) => (p.$isToday ? todayTint(p) : weekendTint(p))}; }
`;

/** 날짜 숫자 — 본문 글꼴의 고른 숫자. 오늘은 붉은 알약에 흰 글씨 */
export const DateNumber = styled(C.DateNumber)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 5px;
    border-radius: 999px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 12px;
    font-weight: ${(p) => (p.$isToday ? 700 : 500)};
    font-variant-numeric: tabular-nums;
    color: ${(p) => (p.$isToday ? p.theme.colors.surface : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$isToday ? p.theme.colors.primary : "transparent")};
    filter: none;
`;

/** 격자의 세로 칸 — 아주 옅은 실선. 오늘은 옅은 붉은 칸 가운데에 가는 붉은 선 */
export const TimelineVerticalLine = styled(C.TimelineVerticalLine)`
    position: relative;
    border-right: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.07 : 0.06)};
    background-color: ${(p) => (p.$isToday ? todayTint(p) : "transparent")};

    &[data-weekend] { background-color: ${(p) => (p.$isToday ? todayTint(p) : weekendTint(p))}; }

    ${(p) => p.$isToday && css`
        &::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 1.5px;
            margin-left: -0.75px;
            background-color: ${withAlpha(p.theme.colors.primary, dark(p) ? 0.55 : 0.45)};
        }
    `}
`;

/** 잇는 선 — 붉음 대신 옅은 밤색(화살촉도 같은 빛) */
export const DependencySvg = styled(C.DependencySvg)`
    color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.8)};
`;

export const DependencyLine = styled(C.DependencyLine)`
    stroke: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.7)};
    opacity: 1;
`;

/**
 * 작업 막대 — 둥근 모서리, 상태 빛깔을 카드 바탕에 섞어 깐 면(격자가 비치지 않게 불투명)과 왼쪽 3px 띠. 글은 글자색.
 * 끝낸 일은 옅은 밤색 면에 옅은 글, 줄을 긋는다.
 */
export const TaskNode = styled(C.TaskNode)`
    height: 28px;
    padding: 0 10px 0 11px;
    border: none;
    border-radius: 6px;
    background: ${(p) => (p.$status === "done"
        ? `color-mix(in srgb, ${p.theme.colors.text} ${dark(p) ? 9 : 6}%, ${p.theme.colors.surface})`
        : `color-mix(in srgb, ${statusColor(p, p.$status)} ${dark(p) ? 24 : 18}%, ${p.theme.colors.surface})`)};
    color: ${(p) => (p.$status === "done" ? p.theme.colors.textSecondary : p.theme.colors.text)};
    box-shadow: ${(p) => [
        `inset 3px 0 0 ${p.$status === "done" ? withAlpha(p.theme.colors.success, 0.55) : statusColor(p, p.$status)}`,
        p.$isDragging ? (dark(p) ? "0 6px 16px rgba(0, 0, 0, 0.5)" : "0 6px 16px rgba(86, 54, 32, 0.22)") : "",
    ].filter(Boolean).join(", ")};
    text-decoration-color: ${(p) => hair(p.theme, 0.45)};
    font-weight: 500;

    &:hover {
        background: ${(p) => (p.$status === "done"
            ? `color-mix(in srgb, ${p.theme.colors.text} ${dark(p) ? 14 : 11}%, ${p.theme.colors.surface})`
            : `color-mix(in srgb, ${statusColor(p, p.$status)} ${dark(p) ? 34 : 28}%, ${p.theme.colors.surface})`)};
        color: ${(p) => p.theme.colors.text};
    }

    &:focus-visible {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
        outline-offset: 2px;
    }
`;

/** 막대의 이름 — 막대 밖에 쓸 때(짧은 막대)도 끝낸 일의 줄 긋기를 이어받는다(밖으로 빠진 글에는 줄이 저절로 건너가지 않는다) */
export const TaskNodeText = styled(C.TaskNodeText)`
    font-size: 12.5px;
    line-height: 1.2;
    text-decoration: inherit;
`;

/** 막대 오른쪽 끝의 잇기 단추 — 카드 바탕의 작은 동그라미, 올리면 붉게 */
export const Connector = styled(C.Connector)`
    background: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.2 : 0.16)};
    color: ${(p) => p.theme.colors.textSecondary};

    &:hover {
        color: ${(p) => p.theme.colors.primary};
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.14)};
    }

    &[aria-pressed="true"] {
        color: ${(p) => p.theme.colors.primary};
        border-color: ${(p) => p.theme.colors.primary};
        background: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 14%, ${p.theme.colors.surface})`};
    }
`;

export const TaskResizeHandle = styled(C.TaskResizeHandle)`
    border-radius: 0 6px 6px 0;

    &:hover { background-color: ${(p) => hair(p.theme, 0.14)}; }
`;

/* ── 폰의 날짜 순 목록: 옅은 선으로 나뉜 줄, 앞에 상태 점 ───────────────────── */

export const AgendaList = styled(C.AgendaList)`
    padding: 0 12px 10px;
    ${thinScroll}
`;

export const AgendaRow = styled(C.AgendaRow)`
    gap: 12px;
    min-height: 50px;
    padding: 10px 6px 10px 4px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};
    border-left: none;

    &::before {
        content: "";
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        border-radius: 50%;
        background-color: ${(p) => statusColor(p, p.$status)};
    }

    &:active { background: ${(p) => hair(p.theme, 0.04)}; }
`;

export const AgendaWhen = styled(C.AgendaWhen)`
    min-width: 5.6em;

    b {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 13px;
        font-weight: 600;
        color: ${(p) => p.theme.colors.text};
    }

    em {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 12px;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

export const AgendaTitle = styled(C.AgendaTitle)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 14px;
    text-decoration-color: ${(p) => hair(p.theme, 0.45)};
`;

export const AgendaEmpty = styled(C.AgendaEmpty)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13px;
    opacity: 1;
`;

/** 폰의 잇기 단추 — 둥근 네모 */
export const MobileConnector = styled(C.MobileConnector)`
    border-radius: 10px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.18 : 0.14)};
    background: transparent;
    color: ${(p) => p.theme.colors.textSecondary};

    &[aria-pressed="true"] {
        color: ${(p) => p.theme.colors.primary};
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)};
        background: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1)};
    }
`;
