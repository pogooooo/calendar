/**
 * Maple 의 일간 달력 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선은 먹 하이라인으로, 시간표의 일정은 마스킹테이프로, 마름모는 잎으로.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { hair, inkCheckbox, leafBullet, tape } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialDayCalendar.styles";

export const DateHeader = styled(C.DateHeader)`
    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }
    letter-spacing: 2px;
`;

export const SectionToggle = styled(C.SectionToggle)`
    border-bottom-color: ${(p) => (p.$collapsed ? "transparent" : hair(p.theme, 0.45))};
    letter-spacing: 0.04em;
`;

export const TimelineSection = styled(C.TimelineSection)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

/**
 * 시간표의 짜임이 다르다 — Celestial 은 한 시각마다 테두리를 두른 칸을 띄워 놓지만,
 * Maple 은 장부 종이다. 왼쪽에 좁은 여백 기둥(겹줄)을 세우고 시각을 그 선에 붙여 오른쪽으로 적으며,
 * 칸의 테두리를 걷어 일정이 줄 위에 그대로 눕게 한다. 세 시각마다 줄이 굵어진다.
 */
export const TimeRow = styled(C.TimeRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};

    /* 세 시각마다 굵은 줄 — 장부의 구획 */
    &:nth-child(3n) { border-bottom-color: ${(p) => hair(p.theme, 0.4)}; }

    /* 여백 기둥: 시각은 선에 붙여 오른쪽 끝에 */
    .time-label {
        width: 42px;
        justify-content: flex-end;
        padding-right: 8px;
        border-right: 1px solid ${(p) => hair(p.theme, 0.5)};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.85rem;
        letter-spacing: 0.01em;
    }

    /* 겹줄: 여백 기둥 바로 옆의 가는 선 하나 */
    .time-slots {
        border-left: 1px solid ${(p) => hair(p.theme, 0.22)};
        margin-left: 2px;
        padding: 4px 12px 4px 8px;
    }

    /* 칸의 테두리를 걷는다 — 종이의 줄만 남는다 */
    .time-slots .slot-bar-container {
        border: none;
        border-radius: 0;
    }

    .time-slots .slot-box {
        border-right-color: ${(p) => hair(p.theme, 0.16)};

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

    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.16)}; }

    .box { ${(p) => inkCheckbox(p.$isDone)} }
    input:focus-visible + .box { outline: none; &::before { background-color: ${(p) => p.theme.colors.primary}; } }
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

    .check-btn {
        ${(p) => inkCheckbox(p.$isDone)}
        &:focus-visible { outline: none; &::before { background-color: ${(p) => p.theme.colors.primary}; } }
    }
`;

export const TaskForm = styled(C.TaskForm)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;
