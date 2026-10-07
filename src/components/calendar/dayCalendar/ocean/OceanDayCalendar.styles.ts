/**
 * 바다의 일간 — 물가에 누운 띠. 데스크톱에서는 세로로 쌓던 칸들을 **가로로 늘어놓는다**:
 *   [그날 목록] | [시간표] | [챌린지 · 체크 · 메모]
 * (Celestial·Maple 은 위에서 아래로 쌓고, 사이 손잡이를 위아래로 끈다.) 위아래 손잡이는 쓰지 않는다.
 * 겉: 금빛 실선 상자 대신 둥근 유리 웅덩이, 마름모 대신 진주, 체크칸은 물방울, 시간표 막대는 물빛 알약.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { glass, R, waveUnderline, bubbleCheck, pearl, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialDayCalendar.styles";

const DESKTOP = "@media (min-width: 769px)";

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
`;

/** 날짜 머리 — 실선 대신 물결 밑줄 */
export const DateHeader = styled(C.DateHeader)`
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.04em;
    hr { border: none; height: 6px; ${waveUnderline(0.45)} background-size: 18px 5px; opacity: 0.9; }
`;

export const ContentLayout = styled(C.ContentLayout)`
    ${DESKTOP} {
        flex-direction: row;
        gap: 14px;
        overflow: hidden;
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
    ${glass("soft")}
    ${card}
    ${DESKTOP} {
        flex: 0 0 250px;
        max-height: none;
        height: 100%;
        margin-bottom: 0;
    }
`;

export const TodoCardHead = styled(C.TodoCardHead)`
    border-bottom: none;
    ${waveUnderline(0.35)}
    background-size: 18px 5px;
    padding-bottom: 10px;
    i { ${pearl("8px")} }
    .count {
        border-radius: ${R.pill};
        padding: 1px 8px;
        background: ${(p) => withAlpha(p.theme.colors.accent, 0.25)};
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const TodoRow = styled(C.TodoRow)`
    border-radius: 12px;
    border: none;
    transition: background-color 0.2s ease, transform 0.2s ease;
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; transform: translateX(2px); }
    .dot { border-radius: 50%; transform: none; box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.6); }
    .time { font-family: ${(p) => p.theme.fonts.numeral}; font-weight: 600; }
`;

export const TimelineSection = styled(C.TimelineSection)`
    border: none;
    ${glass("soft")}
    ${card}
    ${DESKTOP} {
        flex: 1 1 0 !important;
        min-width: 0;
        min-height: 0;
        height: 100%;
    }
`;

export const SectionToggle = styled(C.SectionToggle)`
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.05em;
    .chev { border-radius: 50%; }
    .count { border-radius: ${R.pill}; }
`;

/** 시간표 한 줄 — 칸은 둥근 물웅덩이, 막대는 물빛 알약 */
export const TimeRow = styled(C.TimeRow)`
    .time-label { font-family: ${(p) => p.theme.fonts.numeral}; font-weight: 600; letter-spacing: 0.02em; }
    .time-slots .slot-bar-container {
        border-radius: 10px;
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.18)};
        background: ${(p) => withAlpha(p.theme.colors.accent, 0.05)};
    }
    .time-slots .slot-box {
        border-right: 1px dotted ${(p) => withAlpha(p.theme.colors.primary, 0.16)};
        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.22)}; }
    }
`;

export const SlotTodoItem = styled(C.SlotTodoItem)`
    background: linear-gradient(180deg, ${(p) => withAlpha(p.theme.colors.accent, 0.9)}, ${(p) => withAlpha(p.theme.colors.primary, 0.85)});
    border-radius: ${(p) => `${p.$isContinuingPrev ? 0 : 999}px ${p.$isContinuingNext ? 0 : 999}px ${p.$isContinuingNext ? 0 : 999}px ${p.$isContinuingPrev ? 0 : 999}px`};
    opacity: ${(p) => (p.$isDone ? 0.45 : 1)};
    .todo-text { color: ${(p) => (p.theme.mode === "dark" ? p.theme.colors.background : "#FFFFFF")}; font-weight: 600; }
`;

export const SideSection = styled(C.SideSection)`
    gap: 12px;
    ${DESKTOP} {
        flex: 0 0 270px !important;
        min-width: 0;
        overflow-y: auto;
    }
`;

export const ChallengeCard = styled(C.ChallengeCard)`
    border: none;
    ${glass("soft")}
    ${card}
    .card-header { border-bottom: none; ${waveUnderline(0.3)} background-size: 18px 5px; }
`;

export const TaskCard = styled(C.TaskCard)`
    border: none;
    ${glass("soft")}
    ${card}
    .card-header { border-bottom: none; ${waveUnderline(0.3)} background-size: 18px 5px; }
`;

export const MemoCard = styled(C.MemoCard)`
    border: none;
    ${glass("soft")}
    ${card}
    textarea { ${tideInput} margin: 8px; width: calc(100% - 16px); }
`;

/** 챌린지 한 줄 — 체크칸은 물방울 */
export const ChallengeItem = styled(C.ChallengeItem)`
    border-radius: 12px;
    border-color: transparent;
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; }
    .box { ${(p) => bubbleCheck(p.$isDone, "17px")} border-radius: 50%; }
`;

export const TaskItem = styled(C.TaskItem)`
    border-radius: 12px;
    border-color: transparent;
    .check-btn { ${(p) => bubbleCheck(p.$isDone, "17px")} border-radius: 50%; }
    .delete-btn { border-radius: 50%; }
`;

export const TaskForm = styled(C.TaskForm)`
    input { ${tideInput} }
    button { border-radius: 50%; }
`;
