/**
 * Maple 의 주간 달력(데스크톱 주간 위젯) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 금빛 실선 상자·모서리 사선·빛나는 오늘 틀 대신 옅은 모눈. 요일은 왼쪽에 차분한 글씨,
 * 오늘은 붉은 글씨와 칸에 옅게 든 붉음. 일정 막대는 월간과 같은 둥근 막대(카테고리 색 면 + 왼쪽 띠).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialWeekCalendar.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafChip, paperCard } from "@/styles/maple/ink";

export * from "../celestial/CelestialWeekCalendar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const line = (p: { theme: { mode: string; colors: { text: string } } }) => hair(p.theme, dark(p) ? 0.1 : 0.08);

/** 2026.10.11 - 10.17 ── 🍁 ⚙ — 날짜는 굵은 본문 글씨 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    gap: 10px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0;

    & > hr { border-top-color: ${line}; }
`;

/** 날짜 뒤의 선 — 구슬·별 없이 옅은 선, 끝에 작은 잎 하나 */
export const DateLine = styled(C.DateLine)`
    background-color: ${line};

    &::before { display: none; }

    &::after {
        ${leafChip(5, "9px")}
        right: -4px;
        margin-top: -4.5px;
        clip-path: none;
        animation: none;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.8)};
    }
`;

export const ArrowWrapper = styled(C.ArrowWrapper)`
    transition: opacity 0.15s ease;
    &:hover { filter: none; opacity: 0.7; }
`;

/** 요일 줄: 상자·모서리 장식 없이 아래로 옅은 선 하나 */
export const Header = styled(C.Header)`
    && { border-top: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; border-radius:0; background:transparent; }
    font-family: ${(p) => p.theme.fonts.body};
    border: none;
    border-bottom: 1px solid ${line};

    &::before, &::after { content: none; }
`;

/** 요일은 왼쪽에 차분한 글씨 — 오늘은 붉은 글씨. 해낸 자국(밑선)은 칸 왼쪽 위의 잎(DayCellDecor)이 맡는다 */
export const DayNameBox = styled(C.DayNameBox)`
    && { font-family: ${(p) => p.theme.fonts.display}; background: ${(p) => hair(p.theme, 0.035)}; border-right-color: ${(p) => hair(p.theme, 0.13)}; }
    && .day-name { font-size: 0.85rem; letter-spacing: 0; }
    height: 40px;
    justify-content: flex-start;
    padding-left: 12px;
    border-right: 1px solid ${line};
    color: ${(p) => (p.$isToday ? p.theme.colors.primary : p.theme.colors.textSecondary)};

    &:first-child { color: ${(p) => (p.$isToday ? p.theme.colors.primary : p.theme.colors.weekend)}; }

    /* "SUN" → "Sun" */
    .day-name {
        font-size: 0.8125rem;
        font-weight: ${(p) => (p.$isToday ? 700 : 600)};
        letter-spacing: 0.02em;
        text-transform: lowercase;

        &::first-letter { text-transform: uppercase; }
    }

    .day-mark { display: none; }

    /* 빛나는 오늘 틀은 없다 — 칸(DaySlot)에 붉음이 옅게 든다 */
    ${(p) => p.$isToday && css`
        &::before { content: none; }
    `}
`;

export const BarContainer = styled(C.BarContainer)`
    border: none;

    &::before, &::after { content: none; }
`;

/** 칸 위의 + — 옅은 둥근 네모 */
export const AddTodoButton = styled(C.AddTodoButton)`
    top: 6px;
    left: 6px;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 7px;
    background-color: ${(p) => hair(p.theme, 0.06)};
    color: ${(p) => p.theme.colors.textSecondary};

    svg { width: 14px; height: 14px; }

    &:hover {
        transform: none;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.12)};
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const DaySlot = styled(C.DaySlot)`
    && {
        border-right-color: ${(p) => hair(p.theme, dark(p) ? 0.14 : 0.12)};
        background-color: ${(p) => p.$isToday ? withAlpha(p.theme.colors.primary, 0.06) : 'transparent'};
        background-image: repeating-linear-gradient(to bottom, transparent 0 27px, ${(p) => hair(p.theme, 0.06)} 27px 28px);
        background-position: 0 2px;
    }
    border-left: none;
    border-right: 1px solid ${line};
    background-color: ${(p) => (p.$isToday ? withAlpha(p.theme.colors.primary, dark(p) ? 0.1 : 0.05) : "transparent")};

    &:last-child { border-right: none; }
`;

/* 막대는 칸 위쪽을 비우고 시작한다 — 그 자리에 챌린지 잎(DayCellDecor)과 마우스를 올리면 뜨는 + 가 앉는다 */
export const TodoBarList = styled(C.TodoBarList)`
    gap: 3px;
    margin-top: 30px;
`;

/** 일정 막대 — 월간과 같은 말: 카테고리 색을 옅게 깐 둥근 막대, 시작에 3px 색 띠, 글은 글자색 */
export const TodoBarItem = styled(C.TodoBarItem)`
    && { font-size: 0.76rem; font-weight: 550; }
    height: 22px;
    align-items: center;
    border: none;
    margin-left: ${(p) => (p.$isStart ? "6px" : "0")};
    margin-right: ${(p) => (p.$isEnd ? "6px" : "0")};
    border-radius: ${(p) => `${p.$isStart ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isStart ? 5 : 0}px`};
    background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.primary} ${dark(p) ? 26 : 19}%, ${p.theme.colors.surface})`};
    box-shadow: ${(p) => (p.$isStart ? `inset 3px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.text};

    .todo-title { padding: 0 6px 0 9px; }

    ${(p) => p.$isDone && css`
        clip-path: none;
        background-color: ${hair(p.theme, dark(p) ? 0.07 : 0.05)};
        box-shadow: ${p.$isStart ? `inset 3px 0 0 ${withAlpha(p.$color ?? p.theme.colors.primary, 0.45)}` : "none"};

        .todo-title {
            opacity: 1;
            color: ${p.theme.colors.textSecondary};
        }
    `}
`;

export const TodoBarSpacer = styled(C.TodoBarSpacer)`
    height: 22px;
`;

export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin: 1px 6px 0;
    padding: 1px 5px;
    border-radius: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    text-align: left;

    &:hover {
        text-shadow: none;
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.08)};
    }
`;

export const ModalContainer = styled(C.ModalContainer)`
    ${paperCard()}
    border-radius: 14px;
`;

export const ModalHeader = styled(C.ModalHeader)`
    border-bottom-color: ${line};
    background-color: transparent;
    font-weight: 700;
`;
