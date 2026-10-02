/**
 * Maple 의 월간 달력 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선은 먹 하이라인으로, 일정 막대는 마스킹테이프로, 오늘은 눌러 말린 잎(F3)으로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { ASSET, inkMask, leafBullet, tape, washBand, washBandDark } from "@/styles/maple/ink";

export * from "../celestial/CelestialMonthCalendar.styles";

const hair = (p: { theme: { colors: { text: string } } }, a = 0.28) => withAlpha(p.theme.colors.text, a);

export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    /* 앞·뒤 단추: lucide 꺾쇠를 숨기고 먹 화살(J8)을 그린다. 첫째 단추가 앞, 둘째가 뒤 */
    .nav-btn {
        svg { display: none; }
        &::before {
            content: "";
            display: block;
            width: 40px;
            height: 13px;
            ${inkMask("ink-arrow-left.webp")}
            background-color: ${(p) => p.theme.colors.primary};
        }
        &:nth-of-type(2)::before { ${inkMask("ink-arrow-right.webp")} background-color: ${(p) => p.theme.colors.primary}; }
        ${MOBILE} { ${NOT_WIDGET} &::before { width: 28px; } }
    }

    font-size: 1rem;
    letter-spacing: 0.06em;
`;

export const TodayButton = styled(C.TodayButton)`
    border-color: ${(p) => hair(p, 0.4)};
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.1em;
`;

/** 요일 줄: 옅은 수채 띠 위에 먹글씨. 띠는 ::before 에 깔아 흐리게 한다 */
export const Header = styled(C.Header)`
    border-color: ${(p) => hair(p, 0.45)};

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        ${washBand}
        ${(p) => p.theme.mode === "dark" && washBandDark}
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.5 : 0.38)};
    }

    &::after { display: none; }
`;


export const DayNameBox = styled(C.DayNameBox)`
    position: relative;
    border-right-color: ${(p) => hair(p, 0.25)};
    color: ${(p) => p.theme.colors.text};

    .day-name {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.05rem;
        letter-spacing: 0.14em;
    }

    ${MOBILE} {
        .day-name { font-size: 0.7rem; }
    }
`;

export const GridContainer = styled(C.GridContainer)`
    border-color: ${(p) => hair(p, 0.45)};
`;

export const WeekRowContainer = styled(C.WeekRowContainer)`
    border-bottom-color: ${(p) => hair(p, 0.25)};
`;

/**
 * 칸 자체가 다르다 — Celestial 은 선으로 나눈 격자에 왼쪽 위 날짜, Maple 은 종이에 붙인 표본이라
 * 날짜가 오른쪽 위 구석(도감의 쪽 번호 자리)에 앉고, 고른 칸은 빛나는 대신 황토 물이 든다.
 */
export const DayCell = styled(C.DayCell)`
    border-right-color: ${(p) => hair(p, 0.22)};
    box-shadow: none;
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.accent, 0.24) : "transparent")};

    .day-header {
        padding: 5px 7px 2px;

        /* 날짜는 도감의 쪽 번호처럼 오른쪽 구석에 (Celestial 은 왼쪽 위) */
        & > div:first-child { justify-content: flex-end; }

        .day-number {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-size: 1.05rem;
            font-weight: ${(p) => (p.$isToday || p.$isSelected) ? 600 : 500};
            letter-spacing: 0.02em;
        }
    }

    /* 날짜가 오른쪽으로 갔으니 + 는 왼쪽으로 */
    .add-btn { right: auto; left: 6px; }

    &:hover {
        box-shadow: none;
        background-color: ${(p) => withAlpha(p.theme.colors.accent, p.$isSelected ? 0.3 : 0.12)};
    }

    ${MOBILE} {
        .day-header { padding: 3px 5px 0; }
        .day-header .day-number { font-size: 0.86rem; }
        &:active { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.3)}; }
    }
`;

/** 오늘: 눌러 말린 잎(F3)이 숫자 뒤에 깔린다 */
export const TodayDisc = styled(C.TodayDisc)`
    width: 64px;
    height: 64px;
    margin: -34px 0 0 -32px;
    background: url("${ASSET}/today-marker.webp") center / contain no-repeat;
    opacity: ${(p) => p.theme.mode === "dark" ? 0.7 : 1};

    .ring, .tick, .core { display: none; }

    ${MOBILE} {
        width: 40px;
        height: 40px;
        margin: -21px 0 0 -20px;
    }
`;

/** 일정 막대 = 마스킹테이프. 카테고리 색을 종이에 옅게 섞고, 위아래는 찢긴 결 */
export const TodoBarItem = styled(C.TodoBarItem)`
    border: none;
    border-radius: 0;
    background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.accent} ${p.theme.mode === "dark" ? "42%" : "34%"}, ${p.theme.colors.background})`};
    ${tape}
    height: 21px;

    .todo-title {
        color: ${(p) => p.theme.colors.text};
        font-family: ${(p) => p.theme.fonts.body};
    }

    &:hover {
        background-color: ${(p) => `color-mix(in srgb, ${p.$color ?? p.theme.colors.accent} 52%, ${p.theme.colors.background})`};
    }

    ${(p) => p.$isDone && css`
        opacity: 0.45;
        background-color: ${withAlpha(p.theme.colors.text, 0.08)};
    `}

    ${MOBILE} {
        ${NOT_WIDGET} & {
            ${(p) => leafBullet(!!p.$isDone, "9px")}
            mask-size: contain;
            -webkit-mask-size: contain;
            background-color: ${(p) => p.$color || p.theme.colors.primary};
            opacity: 1;
        }
    }
`;

export const MoreButton = styled(C.MoreButton)`
    font-family: ${(p) => p.theme.fonts.numeral};
`;
