/**
 * Maple 의 주간 달력 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·구슬·별 대신 먹 하이라인과 잎. 오늘 칸은 빛나는 틀이 아니라 황토 물이 든 종이.
 * 일정 막대는 마스킹테이프, 끝낸 일은 바랜 테이프.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialWeekCalendar.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafBullet, stampButton, tape } from "@/styles/maple/ink";

export * from "../celestial/CelestialWeekCalendar.styles";

export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    letter-spacing: 0.06em;
    font-size: 1rem;

    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }

    button { ${stampButton("default")} }
`;

/** 날짜 사이의 선: 구슬·별 없이 먹 하이라인, 끝에 작은 잎 하나 */
export const DateLine = styled(C.DateLine)`
    background-color: ${(p) => hair(p.theme, 0.45)};

    &::before { display: none; }

    &::after {
        ${leafBullet(true, "9px")}
        clip-path: none;
        background-color: ${(p) => p.theme.colors.primary};
        animation: none;
        right: -4px;
        margin-top: -4.5px;
    }
`;

export const ArrowWrapper = styled(C.ArrowWrapper)`
    &:hover { filter: none; opacity: 0.7; }
`;

export const Header = styled(C.Header)`
    border-color: ${(p) => hair(p.theme, 0.45)};
    &::after { display: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    border-right-color: ${(p) => hair(p.theme, 0.25)};

    /* 표의 머리 — 요일은 왼쪽에 적고, 해낸 자국은 오른쪽 여백에 세로로 선다 */
    justify-content: flex-start;
    padding-left: 11px;

    .day-mark {
        left: auto;
        right: 9px;
        bottom: auto;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 14px;
    }

    .day-mark.done { width: 1px; height: 22px; }

    .day-name {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.1rem;
        letter-spacing: 0.12em;
    }

    .day-mark { background-color: ${(p) => hair(p.theme, 0.5)}; }
    .day-mark.done { background-color: ${(p) => p.theme.colors.primary}; box-shadow: none; }
    .day-mark.done::before, .day-mark.done::after { display: none; }

    /* 오늘: 빛나는 틀 대신 요일 이름 위에 붉은 잎 하나 */
    ${(p) => p.$isToday && css`
        &::before {
            border: none;
            box-shadow: none;
            width: 12px;
            height: 12px;
            top: 6px;
            left: calc(50% - 6px);
            ${leafBullet(true, "12px")}
            background-color: ${p.theme.colors.primary};
            opacity: 0.9;
        }
        .day-name { color: ${p.theme.colors.primary}; }
    `}
`;

export const BarContainer = styled(C.BarContainer)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

/** 칸 위의 + : 네모 도장(J2) */
export const AddTodoButton = styled(C.AddTodoButton)`
    ${stampButton("default", { square: true })}
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 2px;
    color: ${(p) => p.theme.colors.primary};

    &:hover { transform: none; }
`;

export const DaySlot = styled(C.DaySlot)`
    border-right-color: ${(p) => hair(p.theme, 0.25)};
    background-color: ${(p) => (p.$isToday ? withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.08 : 0.14) : "transparent")};
`;

/** 일정 막대 = 마스킹테이프 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    border-radius: 0;
    background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.accent} ${p.theme.mode === "dark" ? "42%" : "34%"}, ${p.theme.colors.background})`};
    ${tape}
    color: ${(p) => p.theme.colors.text};

    ${(p) => p.$isDone && css`
        box-shadow: none;
        clip-path: none;
        background-color: ${withAlpha(p.theme.colors.text, 0.08)};
        .todo-title { opacity: 0.6; }
    `}
`;

export const MoreButton = styled(C.MoreButton)`
    font-family: ${(p) => p.theme.fonts.numeral};
`;

export const ModalContainer = styled(C.ModalContainer)`
    border-color: ${(p) => hair(p.theme, 0.5)};
`;

export const ModalHeader = styled(C.ModalHeader)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;
