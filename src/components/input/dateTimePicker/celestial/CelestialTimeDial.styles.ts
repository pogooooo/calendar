/**
 * TimeDial 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

/** 문자판의 시 이름 (0~23시). Celestial 은 로마 숫자 — 갈래가 제 숫자를 줄 수 있게 모양과 함께 둔다 */
export const HOUR_NAMES: readonly string[] = [
    "XXIV", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
    "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII",
];

export const Wrap = styled.div`
    padding: 4px 0 2px;
`;

/* 다이얼 위의 적는 칸 — 자판이 있는 곳에서는 이쪽이 빠르다 */
export const Entry = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;

    b {
        margin-top: 6px;
        font-family: ${p => p.theme.fonts.display};
        font-size: 1.2rem;
        font-weight: 400;
        color: ${p => p.theme.colors.primary};
        opacity: 0.6;
    }
`;

/** 시(또는 분) 한 칸: 큰 숫자 + 옆의 작은 오르내림 + 밑의 단위 */
export const Field = styled.label`
    position: relative;
    display: grid;
    grid-template-columns: auto 12px;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 4px;

    input {
        grid-column: 1;
        grid-row: 1;
        width: 58px;
        padding: 2px 0 4px;
        text-align: center;
        font-family: ${p => p.theme.fonts.display};
        font-size: 1.5rem;
        letter-spacing: 0.06em;
        font-variant-numeric: tabular-nums;
        color: ${p => p.theme.colors.text};
        background: none;
        border: none;
        border-bottom: 1px solid ${p => p.theme.colors.primary}55;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        cursor: text;

        &:hover { border-bottom-color: ${p => p.theme.colors.primary}99; }

        &:focus {
            outline: none;
            border-bottom-color: ${p => p.theme.colors.primary};
            box-shadow: 0 1px 8px -4px ${p => p.theme.colors.primary};
        }
    }

    /* 오르내림 화살 — 마우스가 있는 곳에서만 자리를 차지한다 */
    .spin {
        grid-column: 2;
        grid-row: 1;
        display: none;
        flex-direction: column;
        gap: 1px;
    }

    .spin button {
        width: 12px;
        height: 11px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 7px;
        line-height: 1;
        color: ${p => p.theme.colors.textSecondary};
        background: none;
        border: none;
        cursor: pointer;

        &:hover { color: ${p => p.theme.colors.primary}; }
    }

    em {
        grid-column: 1 / -1;
        grid-row: 2;
        margin-top: 3px;
        font-style: normal;
        text-align: center;
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.58rem;
        letter-spacing: 0.2em;
        color: ${p => p.theme.colors.textSecondary};
    }

    @media (hover: hover) and (pointer: fine) {
        .spin { display: flex; }
    }
`;

export const Dial = styled.svg`
    display: block;
    width: 184px;
    height: 184px;
    margin: 0 auto;
    touch-action: none;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;

    text { user-select: none; -webkit-user-select: none; }

    &:active { cursor: grabbing; }

    .rim {
        fill: none;
        stroke: ${p => p.theme.colors.primary};
        stroke-opacity: 0.24;
        stroke-width: 0.5;
    }
    .rim.inner { stroke-opacity: 0.18; stroke-width: 0.45; }

    .tick { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.16; stroke-width: 0.3; }
    .tick.long { stroke-opacity: 0.42; stroke-width: 0.6; }
    .tick.faint { stroke-opacity: 0.28; stroke-width: 0.35; }

    .stem { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.55; }
    .stem.thin { stroke-width: 0.4; stroke-opacity: 0.6; }
    .cross { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.7; }
    .cross.thin { stroke-width: 0.5; stroke-opacity: 0.7; }
    .cross.faintCross { stroke-width: 0.55; stroke-opacity: 0.7; }

    .tip, .hub {
        fill: ${p => p.theme.colors.surface};
        stroke: ${p => p.theme.colors.primary};
        stroke-width: 0.7;
    }

    /* 숫자를 짚어 시를 고른다 */
    .num { cursor: pointer; }
    .num:hover { fill: ${p => p.theme.colors.primary}; }

    .num {
        font-family: ${p => p.theme.fonts.display};
        font-size: 5px;
        fill: ${p => p.theme.colors.text};
        opacity: 0.7;
    }
    .num.on {
        font-size: 6.3px;
        fill: ${p => p.theme.colors.primary};
        opacity: 1;
    }
    .mnum {
        font-family: ${p => p.theme.fonts.display};
        font-size: 3.9px;
        fill: ${p => p.theme.colors.textSecondary};
        opacity: 0.65;
    }

    .hand, .mhand {
        transform-box: view-box;
        transform-origin: 50px 50px;
        transition: transform 0.44s cubic-bezier(0.34, 1.14, 0.38, 1);
    }
    .mhand { transition-duration: 0.54s; }

    /* 돌리는 동안은 바늘이 손가락을 바로 따라와야 한다 */
    &.dragging .hand, &.dragging .mhand { transition: none; }

    /* 잡은 고리만 살짝 진해진다 — 잡았다는 느낌만, 놓으면 원래대로 */
    &[data-grab="outer"] .rim:not(.inner) { stroke-opacity: 0.5; }
    &[data-grab="inner"] .rim.inner { stroke-opacity: 0.45; }

    @media (prefers-reduced-motion: reduce) {
        .hand, .mhand { transition: none; }
    }
`;

/** 자주 쓰는 분 — 한 번 눌러 맞춘다 */
export const Quick = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    margin-top: 8px;

    button {
        padding: 5px 0;
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.68rem;
        font-variant-numeric: tabular-nums;
        color: ${p => p.theme.colors.textSecondary};
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}33;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

        &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }

        &[data-on="1"] {
            color: ${p => p.theme.colors.primary};
            border-color: ${p => p.theme.colors.primary};
            background-color: ${p => p.theme.colors.primary}1A;
        }
    }

    ${MOBILE} {
        grid-template-columns: repeat(4, 1fr);
        button { padding: 9px 0; font-size: 0.74rem; }
    }
`;

/* 다이얼 밑 단추 줄: 시 ±1 · 분 ±5. 앱의 유령 단추와 같은 결 */
export const Steps = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 6px;
`;

export const StepGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    span {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.62rem;
        letter-spacing: 0.2em;
        color: ${p => p.theme.colors.textSecondary};
        min-width: 2.2em;
        text-align: center;
    }

    button {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.9rem;
        width: 36px;
        height: 30px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}55;
        border-radius: 6px;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;
        transition: border-color 0.15s;

        &:hover, &:active { border-color: ${p => p.theme.colors.primary}; }
        &:focus-visible { outline: 2px solid ${p => p.theme.colors.primary}; outline-offset: 1px; }

        /* 폰에서는 손가락만큼 */
        ${MOBILE} { width: 44px; height: 36px; }
    }
`;
