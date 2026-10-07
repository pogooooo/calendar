/**
 * 물가의 물거품 — 밀려왔다 물러나는 박자(7초). 밤에는 하얀 거품 대신 푸르게 빛나는 물결(야광 플랑크톤).
 * 움직임을 끄거나 창이 숨으면 멈춘다.
 */
import styled, { keyframes } from "styled-components";

const lap = keyframes`
    0%, 100% { transform: translateX(0); }
    50%      { transform: translateX(3px); }
`;
const recede = keyframes`
    0%, 100% { transform: translateX(0); opacity: 0.75; }
    50%      { transform: translateX(7px); opacity: 0.35; }
`;
const drift = keyframes`
    0%, 100% { transform: translateX(0); opacity: 0.4; }
    50%      { transform: translateX(-4px); opacity: 0.15; }
`;
const bob = keyframes`
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-5px) scale(1.04); }
`;

export const Shore = styled.div<{ $hovered: boolean }>`
    position: absolute;
    inset: 0;
    pointer-events: none;

    .clip { position: absolute; inset: 0; overflow: hidden; }
    .water { position: absolute; top: 0; left: 0; display: block; overflow: visible; }

    .wet-a { stop-color: ${(p) => (p.theme.mode === "dark" ? "#0A1016" : "#8A6236")}; stop-opacity: 0; }
    .wet-b { stop-color: ${(p) => (p.theme.mode === "dark" ? "#0A1016" : "#8A6236")}; stop-opacity: ${(p) => (p.theme.mode === "dark" ? 0.35 : 0.2)}; }
    .shallow-a { stop-color: ${(p) => (p.theme.mode === "dark" ? "#6FE3DA" : "#FFFFFF")}; stop-opacity: ${(p) => (p.theme.mode === "dark" ? 0.18 : 0.55)}; }
    .shallow-b { stop-color: ${(p) => (p.theme.mode === "dark" ? "#6FE3DA" : "#FFFFFF")}; stop-opacity: 0; }

    .foam { animation: ${lap} 7s ease-in-out infinite; }
    .foam .body { fill: ${(p) => (p.theme.mode === "dark" ? "rgba(127, 245, 234, 0.32)" : "rgba(255, 255, 255, 0.96)")}; }
    .foam .glow {
        fill: none;
        stroke: ${(p) => (p.theme.mode === "dark" ? "rgba(127, 245, 234, 0.35)" : "rgba(255, 255, 255, 0.45)")};
        stroke-width: ${(p) => (p.theme.mode === "dark" ? 7 : 5)};
        stroke-linejoin: round;
    }
    .foam .hole { fill: ${(p) => (p.theme.mode === "dark" ? "rgba(6, 40, 52, 0.7)" : "rgba(170, 234, 228, 0.75)")}; }

    .lace { animation: ${recede} 7s ease-in-out infinite; animation-delay: -0.6s; }
    .lace path {
        fill: none;
        stroke: ${(p) => (p.theme.mode === "dark" ? "#8FF7EE" : "#FFFFFF")};
        stroke-width: 1.3;
        stroke-linecap: round;
        stroke-dasharray: 18 6 4 7;
    }
    .lace circle { fill: ${(p) => (p.theme.mode === "dark" ? "#8FF7EE" : "#FFFFFF")}; opacity: 0.8; }
    .lace-far { animation: ${drift} 9s ease-in-out infinite; }
    .lace-far path { fill: none; stroke: ${(p) => (p.theme.mode === "dark" ? "#6FE3DA" : "#FFFFFF")}; stroke-width: 1; stroke-dasharray: 30 10 6 12; }

    /* 올리면 물이 한 번 더 밀려온다 */
    .foam, .lace { transition: filter 0.4s ease; }
    ${(p) => p.$hovered && `
        .foam { filter: brightness(1.08); }
        .lace path { stroke-width: 1.8; }
    `}

    /* 모래 위 — 판 오른쪽 끝(=물 쪽)에서 잰 자리 */
    .beach { position: absolute; inset: 0; }
    .p { position: absolute; display: block; height: auto; }
    .scallop { width: 50px; right: 50px; bottom: 50px; transform: rotate(-16deg); }
    .scallop-sm { width: 24px; right: 112px; bottom: 132px; transform: rotate(24deg); }
    .star { width: 42px; right: 98px; bottom: 22px; transform: rotate(12deg); }
    .star-aqua { width: 28px; right: 46px; bottom: 236px; transform: rotate(-10deg); }
    .conch { width: 40px; right: 26px; bottom: 132px; transform: rotate(-32deg); }
    .dollar { width: 28px; right: 120px; bottom: 84px; }
    .pebble { width: 18px; right: 70px; bottom: 16px; }
    .b { position: absolute; display: block; animation: ${bob} 6s ease-in-out infinite; }
    .b1 { width: 14px; height: 14px; right: 6px; bottom: 190px; }
    .b2 { width: 9px; height: 9px; right: 16px; bottom: 214px; animation-delay: -2.5s; }

    ${(p) => p.theme.mode === "dark" && `
        .p { filter: brightness(0.72) saturate(0.8); }
        .star-aqua { filter: brightness(0.9) drop-shadow(0 0 6px rgba(111, 227, 218, 0.45)); }
    `}

    @media (max-height: 820px) { .conch, .dollar, .scallop-sm, .star-aqua, .b { display: none; } }
    @media (max-height: 680px) { .beach { display: none; } }

    html[data-theme-motion="off"] &, html[data-page-hidden] & { * { animation-play-state: paused !important; } }
    html[data-theme-motion="gentle"] & .lace-far, html[data-theme-motion="gentle"] & .b { animation: none; }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`;
