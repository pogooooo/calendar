/**
 * MaplePageTransition 의 모양 — 도감을 한 장 넘기는 동안 잎 몇 장이 떨어진다.
 *
 * Celestial 의 문양(1.45초)보다 짧다(0.9초). 종이가 잠깐 덮이고, 가운데 먹선 장식이
 * 그려졌다 사라지며, 그 사이로 잎이 흩날린다. 폰에서는 더 짧게.
 */
import styled, { keyframes, css } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const DURATION = "var(--cronos-transition, 0.9s)";
export const MOBILE_DURATION = "0.45s";

export const veilCycle = keyframes`
    0%   { opacity: 0; }
    30%  { opacity: 1; }
    100% { opacity: 0; }
`;

export const ruleCycle = keyframes`
    0%   { opacity: 0; transform: scaleX(0.2); }
    35%  { opacity: 1; transform: scaleX(1); }
    70%  { opacity: 1; transform: scaleX(1); }
    100% { opacity: 0; transform: scaleX(1.05); }
`;

export const fall = keyframes`
    0%   { opacity: 0; transform: translate3d(0, -12vh, 0) rotate(var(--r0)); }
    15%  { opacity: 1; }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translate3d(var(--dx), 70vh, 0) rotate(var(--r1)); }
`;

export const bodyIn = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
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
            animation: ${bodyIn} 0.5s ease-out 0.32s both;

            ${MOBILE} { animation: ${bodyIn} 0.22s ease-out 0.14s both; }
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

/** 가운데의 짧은 먹선 장식(C2) — 색은 테마의 먹 */
export const Rule = styled.span`
    position: absolute;
    width: min(320px, 60vw);
    aspect-ratio: 512 / 118;
    background: ${p => p.theme.colors.text};
    mask: url("/themes/maple/divider-short.webp") center / contain no-repeat;
    -webkit-mask: url("/themes/maple/divider-short.webp") center / contain no-repeat;
    animation: ${ruleCycle} ${DURATION} ease-in-out both;
`;

export const Leaf = styled.img`
    position: absolute;
    top: 0;
    width: 28px;
    height: 28px;
    object-fit: contain;
    animation: ${fall} ${DURATION} cubic-bezier(0.3, 0.1, 0.6, 1) both;
    will-change: transform, opacity;
`;
