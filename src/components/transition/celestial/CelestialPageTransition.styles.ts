/**
 * CelestialPageTransition 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes, css } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const C = 200;

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

export const turn = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(24deg); }
`;

export const turnBack = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(-18deg); }
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

    i {
        position: absolute;
        width: 9px;
        height: 9px;
        border: 1px solid currentColor;
        transform: rotate(45deg);
        opacity: 0;
        animation: ${pipCycle} ${DURATION} ease-out both;
    }

    .tl { top: -4px; left: -4px; }
    .tr { top: -4px; right: -4px; animation-delay: 0.06s; }
    .bl { bottom: -4px; left: -4px; animation-delay: 0.12s; }
    .br { bottom: -4px; right: -4px; animation-delay: 0.18s; }
`;

export const Sigil = styled.svg`
    position: relative;
    width: min(58vh, 400px);
    height: min(58vh, 400px);
    overflow: visible;
    animation: ${sigilCycle} ${DURATION} cubic-bezier(0.33, 0, 0.2, 1) both;

    .rim,
    .star12,
    .tri,
    .moon {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
    }

    .rim,
    .star12,
    .tri,
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

    .star12 {
        stroke-width: 0.9;
        opacity: 0.7;
        animation-delay: 0.06s;
    }

    .tri {
        stroke-width: 0.8;
        opacity: 0.55;
        animation-delay: 0.13s;
    }

    .tri-b { animation-delay: 0.16s; }

    .moon {
        stroke-width: 1.5;
        animation-delay: 0.09s;
    }

    .pip {
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: ${pipCycle} 0.9s ease-out both;
    }
`;
