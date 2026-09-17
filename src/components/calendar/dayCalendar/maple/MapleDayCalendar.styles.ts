/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { hair, leafBullet, tape } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";
export * from "../celestial/CelestialDayCalendar.styles";

/* 금빛 테두리 → 먹 하이라인. 굵기·모양은 Celestial 그대로, 색만 바꾼다 */
const DateHeader = styled(C.DateHeader)`
    border-color: ${(p) => hair(p.theme)};
`;

export const TimelineSection = styled(C.TimelineSection)`
    border-color: ${(p) => hair(p.theme)};
`;

const TimeRow = styled(C.TimeRow)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ChallengeItem = styled(C.ChallengeItem)`
    border-color: ${(p) => hair(p.theme)};
`;

const TodoCardHead = styled(C.TodoCardHead)`
    border-color: ${(p) => hair(p.theme)};
`;

export const TaskItem = styled(C.TaskItem)`
    border-color: ${(p) => hair(p.theme)};
`;

export const TaskForm = styled(C.TaskForm)`
    border-color: ${(p) => hair(p.theme)};
`;

/* ── 손으로 다듬은 것 ─────────────────────────────────────────────────── */

/** 시간표: 안쪽 선들도 먹으로, 칸은 종이 그대로 */
export const TimeRowInk = styled(TimeRow)`
    .time-label {
        border-right-color: ${(p) => hair(p.theme, 0.45)};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.85rem;
    }

    .time-slots .slot-bar-container {
        border-color: ${(p) => hair(p.theme, 0.3)};
        border-radius: 2px;
    }

    .time-slots .slot-box {
        border-right-color: ${(p) => hair(p.theme, 0.22)};

        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }
    }
`;
export { TimeRowInk as TimeRow };

/** 시간표의 일정 = 마스킹테이프 (황토를 종이에 섞고, 글은 먹) */
export const SlotTodoItem = styled(C.SlotTodoItem)`
    background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.accent} ${p.theme.mode === "dark" ? "48%" : "55%"}, ${p.theme.colors.background})`};
    ${tape}

    .todo-text {
        color: ${(p) => p.theme.colors.text};
        font-weight: 600;
    }
`;

export const SectionToggle = styled(C.SectionToggle)`
    border-bottom-color: ${(p) => (p.$collapsed ? "transparent" : hair(p.theme, 0.45))};
    letter-spacing: 0.04em;
`;

export const TaskCard = styled(C.TaskCard)`
    border-color: ${(p) => hair(p.theme, 0.45)};
    .card-header { border-bottom-color: ${(p) => hair(p.theme, 0.45)}; }
`;
export const ChallengeCard = styled(C.ChallengeCard)`
    border-color: ${(p) => hair(p.theme, 0.45)};
    .card-header { border-bottom-color: ${(p) => hair(p.theme, 0.45)}; }
`;
export const MemoCard = styled(C.MemoCard)`
    border-color: ${(p) => hair(p.theme, 0.45)};
    .card-header { border-bottom-color: ${(p) => hair(p.theme, 0.45)}; }
`;
export const TodoCard = styled(C.TodoCard)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

export const TodoCardHeadInk = styled(TodoCardHead)`
    i {
        ${leafBullet(false, "11px")}
        color: ${(p) => p.theme.colors.primary};
    }
`;
export { TodoCardHeadInk as TodoCardHead };

export const DateHeaderInk = styled(DateHeader)`
    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }
`;
export { DateHeaderInk as DateHeader };
