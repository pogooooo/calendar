/**
 * 바다의 일간 — 달력 아래 누운 띠. 데스크톱에서는 세로로 쌓던 칸들을 **가로로 늘어놓는다**:
 *   [그날 목록] | [시간표] | [챌린지 · 체크 · 메모]
 * (Celestial·Maple 은 위에서 아래로 쌓고, 사이 손잡이를 위아래로 끈다.) 위아래 손잡이는 쓰지 않는다.
 * 겉: 금빛 실선 상자 대신 머리카락 선의 납작한 칸, 마름모 대신 작은 점, 체크칸은 동그라미, 시간표 막대는 청록 면.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { MONO, R, bubbleCheck, hairline, ink, label, pearl, surface, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialDayCalendar.styles";

const DESKTOP = "@media (min-width: 769px)";
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
`;

/** 날짜 머리 — 굵은 날짜 한 줄, 실선 없음 */
export const DateHeader = styled(C.DateHeader)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    hr { display: none; }
    ${DESKTOP} { margin-bottom: 10px; padding-left: 4px; }
`;

export const ContentLayout = styled(C.ContentLayout)`
    ${DESKTOP} {
        flex-direction: row;
        gap: 0;
        overflow: hidden;
    }
`;

/**
 * 데스크톱 띠 안의 칸들은 상자(카드)를 두지 않는다 — 띠 한 장 안에서 세로 빛줄로만 나눈다 (카드 안의 카드가 촌스러웠다).
 * 폰에서는 세로로 쌓이므로 원래대로 옅은 카드.
 */
const column = css`
    ${DESKTOP} {
        background: none;
        border: none;
        border-radius: 0;
        box-shadow: none;
    }
`;
const columnDivider = css`
    ${DESKTOP} {
        border-right: 1px solid ${(p) => (p.theme.mode === "dark" ? "rgba(160, 240, 230, 0.09)" : "rgba(6, 60, 66, 0.085)")};
        box-shadow: 1px 0 0 ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.7)")};
    }
`;

/** 위아래 손잡이는 가로 배치에서 뜻이 없다 */
export const ResizeHandle = styled(C.ResizeHandle)`
    ${DESKTOP} { display: none; }
`;

const card = `
    border-radius: ${R.md};
    overflow: hidden;
`;

export const TodoCard = styled(C.TodoCard)`
    ${surface("card")}
    ${card}
    ${column}
    ${columnDivider}
    ${DESKTOP} {
        flex: 0 0 260px;
        max-height: none;
        height: 100%;
        margin-bottom: 0;
        padding-right: 8px;
    }
`;

/** 카드 머리 — 작은 굵은 글씨와 고정폭 개수 */
export const TodoCardHead = styled(C.TodoCardHead)`
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.82rem;
    font-weight: 600;
    padding: 9px 12px;
    i { ${pearl("6px")} transform: none; border: none; }
    .count { font-family: ${MONO}; font-size: 0.68rem; letter-spacing: 0; color: ${(p) => p.theme.colors.textSecondary}; opacity: 1; }
`;

export const TodoRow = styled(C.TodoRow)`
    border-radius: 8px;
    border: none;
    min-height: 38px;
    padding: 7px 10px;
    transition: background-color 0.15s ease;
    &:hover { background-color: ${(p) => ink(p.theme, dark(p) ? 0.07 : 0.045)}; }
    .dot { width: 6px; height: 6px; border-radius: 50%; transform: none; }
    .title { font-size: 0.84rem; }
    .time { font-family: ${MONO}; font-size: 0.66rem; letter-spacing: 0; }
`;

export const TimelineSection = styled(C.TimelineSection)`
    border: none;
    ${surface("card")}
    ${card}
    ${column}
    ${columnDivider}
    ${DESKTOP} {
        flex: 1 1 0 !important;
        min-width: 0;
        min-height: 0 !important;
        height: 100%;
        padding: 0 8px;
    }
`;

export const SectionToggle = styled(C.SectionToggle)`
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0;
    .chev { border-radius: 6px; }
    .count { ${label} border-radius: 6px; }
`;

/** 시간표 한 줄 — 시각은 고정폭, 칸은 머리카락 선, 막대는 청록 면 */
export const TimeRow = styled(C.TimeRow)`
    .time-label { font-family: ${MONO}; font-size: 0.66rem; font-weight: 500; letter-spacing: 0; color: ${(p) => p.theme.colors.textSecondary}; }
    .time-slots .slot-bar-container {
        border-radius: 8px;
        border-color: ${(p) => hairline(p.theme)};
        background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.5)")};
    }
    .time-slots .slot-box {
        border-right: 1px solid ${(p) => hairline(p.theme)};
        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.08)}; }
    }
`;

export const SlotTodoItem = styled(C.SlotTodoItem)`
    background: ${(p) => (p.$isDone ? withAlpha(p.theme.colors.primary, 0.35) : p.theme.colors.primary)};
    border-radius: ${(p) => `${p.$isContinuingPrev ? 0 : 6}px ${p.$isContinuingNext ? 0 : 6}px ${p.$isContinuingNext ? 0 : 6}px ${p.$isContinuingPrev ? 0 : 6}px`};
    .todo-text { color: ${(p) => (dark(p) ? "#06110F" : "#FFFFFF")}; font-weight: 600; }
`;

export const SideSection = styled(C.SideSection)`
    gap: 10px;
    ${DESKTOP} {
        flex: 0 0 280px !important;
        min-width: 0;
        overflow-y: auto;
        gap: 0;
        padding-left: 8px;
    }
`;

/** 오른쪽 칸 안의 묶음들(챌린지·임시 작업·메모) — 데스크톱에서는 상자 없이 가로 빛줄로만 나눈다 */
const stacked = css`
    ${DESKTOP} {
        margin-bottom: 0;
        border-bottom: 1px solid ${(p) => (p.theme.mode === "dark" ? "rgba(160, 240, 230, 0.09)" : "rgba(6, 60, 66, 0.085)")};
        &:last-child { border-bottom: none; }
    }
`;

const cardHeader = `
    .card-header {
        font-size: 0.82rem;
        font-weight: 600;
        padding: 9px 12px;
    }
`;

export const ChallengeCard = styled(C.ChallengeCard)`
    border: none;
    ${surface("card")}
    ${card}
    ${cardHeader}
    ${column}
    ${stacked}
    .card-header { border-bottom: 1px solid ${(p) => hairline(p.theme)}; font-family: ${(p) => p.theme.fonts.body}; }
`;

export const TaskCard = styled(C.TaskCard)`
    border: none;
    ${surface("card")}
    ${card}
    ${cardHeader}
    ${column}
    ${stacked}
    .card-header { border-bottom: 1px solid ${(p) => hairline(p.theme)}; font-family: ${(p) => p.theme.fonts.body}; }
`;

export const MemoCard = styled(C.MemoCard)`
    border: none;
    ${surface("card")}
    ${card}
    ${cardHeader}
    ${column}
    ${stacked}
    .card-header { border-bottom: 1px solid ${(p) => hairline(p.theme)}; font-family: ${(p) => p.theme.fonts.body}; }
    textarea { ${tideInput} margin: 8px; width: calc(100% - 16px); }
`;

/** 챌린지 한 줄 — 체크칸은 동그라미 */
export const ChallengeItem = styled(C.ChallengeItem)`
    border-radius: 8px;
    border-color: transparent;
    &:hover { background-color: ${(p) => ink(p.theme, dark(p) ? 0.07 : 0.045)}; }
    .box { ${(p) => bubbleCheck(p.$isDone, "17px")} box-shadow: none; }
    .title { font-size: 0.84rem; }
`;

export const TaskItem = styled(C.TaskItem)`
    border-radius: 8px;
    border-color: transparent;
    .check-btn { ${(p) => bubbleCheck(p.$isDone, "17px")} box-shadow: none; }
    .delete-btn { border-radius: 6px; }
`;

export const TaskForm = styled(C.TaskForm)`
    input { ${tideInput} }
    button { border-radius: 8px; }
`;
