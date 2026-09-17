/**
 * Maple 의 일간 달력 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선은 먹 하이라인으로, 시간표의 일정은 마스킹테이프로, 마름모는 잎으로.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { hair, leafBullet, tape } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialDayCalendar.styles";

export const DateHeader = styled(C.DateHeader)`
    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }
`;

export const SectionToggle = styled(C.SectionToggle)`
    border-bottom-color: ${(p) => (p.$collapsed ? "transparent" : hair(p.theme, 0.45))};
    letter-spacing: 0.04em;
`;

export const TimelineSection = styled(C.TimelineSection)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

/** 시간표: 안쪽 선들도 먹으로, 칸은 종이 그대로 */
export const TimeRow = styled(C.TimeRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};

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

/** 시간표의 일정 = 마스킹테이프 (황토를 종이에 섞고, 글은 먹) */
export const SlotTodoItem = styled(C.SlotTodoItem)`
    background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.accent} ${p.theme.mode === "dark" ? "48%" : "55%"}, ${p.theme.colors.background})`};
    ${tape}

    .todo-text {
        color: ${(p) => p.theme.colors.text};
        font-weight: 600;
    }
`;

/* 옆 칸들 (챌린지·오늘 할 일·할 일 목록·메모): 틀과 머리글 밑줄을 먹으로 */
const inkCard = `
    border-color: var(--maple-hair);
    .card-header { border-bottom-color: var(--maple-hair); }
`;

export const TaskCard = styled(C.TaskCard)`
    --maple-hair: ${(p) => hair(p.theme, 0.45)};
    ${inkCard}
`;
export const ChallengeCard = styled(C.ChallengeCard)`
    --maple-hair: ${(p) => hair(p.theme, 0.45)};
    ${inkCard}
`;
export const MemoCard = styled(C.MemoCard)`
    --maple-hair: ${(p) => hair(p.theme, 0.45)};
    ${inkCard}
`;
export const TodoCard = styled(C.TodoCard)`
    --maple-hair: ${(p) => hair(p.theme, 0.45)};
    ${inkCard}
`;

export const ChallengeItem = styled(C.ChallengeItem)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const TodoCardHead = styled(C.TodoCardHead)`
    border-bottom-color: ${(p) => hair(p.theme, 0.45)};

    i {
        ${leafBullet(false, "11px")}
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const TaskItem = styled(C.TaskItem)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const TaskForm = styled(C.TaskForm)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;
