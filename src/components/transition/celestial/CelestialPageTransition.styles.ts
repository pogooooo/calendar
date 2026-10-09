/**
 * CelestialPageTransition 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes, css } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { star4Mark } from "@/styles/celestial/ornaments";

export const C = 200;

/**
 * 문양이 그려졌다 지워지는 시간. 넓은 화면에서는 1.45초가 근사하지만, 폰에서는 탭을 자주 오가므로
 * 매번 기다리는 느낌이 된다. CSS 변수로 두고 폰에서만 짧게 줄인다.
 */
export const DURATION = "var(--cronos-transition, 1.45s)";

export const MOBILE_DURATION = "0.55s";

/* 지연이 가장 큰 요소까지 다 그려진 뒤에 지우기 시작하도록 유지 구간을 넉넉히 둔다 */
export const strokeCycle = keyframes`
    0%   { stroke-dashoffset: 100; opacity: 0; }
    8%   { opacity: 1; }
    40%  { stroke-dashoffset: 0; }
    72%  { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: -100; opacity: 0; }
`;

export const fadeCycle = keyframes`
    0%   { opacity: 0; }
    25%  { opacity: 1; }
    66%  { opacity: 1; }
    100% { opacity: 0; }
`;

export const pipCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.3); }
    40%  { opacity: 1; transform: scale(1); }
    70%  { opacity: 1; }
    100% { opacity: 0; transform: scale(1.3); }
`;

/* 점선 고리는 오는 쪽으로(--turn), 눈금은 그 반대로 조금 덜 돈다 */
export const turn = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(var(--turn, 24deg)); }
`;

export const turnBack = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(calc(var(--turn, 24deg) * -0.75)); }
`;

export const sigilCycle = keyframes`
    0%   { transform: scale(0.9); }
    58%  { transform: scale(1); }
    100% { transform: scale(1.07); }
`;

export const veilCycle = keyframes`
    0%   { opacity: 0; }
    28%  { opacity: 1; }
    100% { opacity: 0; }
`;

export const bodyIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

export const Stage = styled.div`
    position: relative;
    height: 100%;

    ${MOBILE} { --cronos-transition: ${MOBILE_DURATION}; }
`;

export const Body = styled.div<{ $animate: boolean }>`
    height: 100%;

    ${p => p.$animate && css`
        @media (prefers-reduced-motion: no-preference) {
            animation: ${bodyIn} 0.6s ease-out 0.62s both;

            ${MOBILE} { animation: ${bodyIn} 0.24s ease-out 0.2s both; }
        }
    `}
`;

export const Overlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
    color: ${p => p.theme.colors.primary};

    @media (prefers-reduced-motion: reduce) {
        display: none;
    }
`;

export const Veil = styled.span`
    position: absolute;
    inset: 0;
    background-color: ${p => p.theme.colors.background};
    animation: ${veilCycle} ${DURATION} ease-in-out both;
`;

/* 타로 카드 테두리처럼 화면을 한 바퀴 그린다 */
export const Frame = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    rect {
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        opacity: 0.45;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
    }
`;

export const Corners = styled.div`
    position: absolute;
    inset: 26px;

    /* 화면 네 귀퉁이의 네 갈래 별 */
    i {
        position: absolute;
        ${star4Mark("13px")}
        opacity: 0;
        animation: ${pipCycle} ${DURATION} ease-out both;
    }

    .tl { top: -6px; left: -6px; }
    .tr { top: -6px; right: -6px; animation-delay: 0.06s; }
    .bl { bottom: -6px; left: -6px; animation-delay: 0.12s; }
    .br { bottom: -6px; right: -6px; animation-delay: 0.18s; }
`;

export const Sigil = styled.svg`
    position: relative;
    width: min(58vh, 400px);
    height: min(58vh, 400px);
    overflow: visible;
    animation: ${sigilCycle} ${DURATION} cubic-bezier(0.33, 0, 0.2, 1) both;

    .rim,
    .ring,
    .axis,
    .moon {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
    }

    .rim,
    .ring,
    .axis,
    .moon {
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
    }

    .rim { stroke-width: 0.9; opacity: 0.5; }
    .rim.thin { stroke-width: 0.7; opacity: 0.42; }
    .rim.inner { animation-delay: 0.1s; }

    .dashed {
        stroke-width: 0.7;
        stroke-dasharray: 2 7;
        opacity: 0.4;
        animation: ${fadeCycle} ${DURATION} ease-in-out both, ${turn} ${DURATION} linear both;
        transform-origin: ${C}px ${C}px;
    }

    .ticks {
        opacity: 0;
        transform-origin: ${C}px ${C}px;
        animation: ${fadeCycle} ${DURATION} ease-in-out 0.05s both, ${turnBack} ${DURATION} linear both;

        line {
            stroke: currentColor;
            vector-effect: non-scaling-stroke;
            opacity: 0.55;
        }
    }

    /* 혼천의 — 축이 먼저, 고리들이 차례로 */
    .axis { stroke-width: 0.8; opacity: 0.5; animation-delay: 0.02s; }
    .ring { stroke-width: 0.9; opacity: 0.66; animation-delay: 0.06s; }
    .ring.ecl { animation-delay: 0.11s; }
    .ring.thin { stroke-width: 0.7; opacity: 0.45; animation-delay: 0.15s; }

    /* 달의 위상·축 끝의 점 — 그어지지 않고 떠오른다 */
    .phases, .ends {
        opacity: 0;
        animation: ${fadeCycle} ${DURATION} ease-in-out 0.08s both;
    }
    .phases .disc { fill: none; stroke: currentColor; stroke-width: 0.8; vector-effect: non-scaling-stroke; opacity: 0.7; }
    .phases .lit, .ends circle { fill: currentColor; opacity: 0.85; }

    .moon {
        stroke-width: 1.5;
        animation-delay: 0.09s;
    }

    .pip {
        fill: currentColor;
        stroke: none;
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: ${pipCycle} 0.9s ease-out both;
    }
`;
