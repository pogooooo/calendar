/**
 * 바다 바탕 장면의 모양. 물빛 그물 캔버스·햇빛 번짐·보케·물방울.
 * 움직임: 보케는 천천히 반짝이고, 물방울은 아주 느리게 떠오른다. 움직임을 끄면 멈춘 그림.
 */
import styled, { keyframes } from "styled-components";

const twinkle = keyframes`
    0%, 100% { opacity: 0.15; transform: scale(0.8); }
    50%      { opacity: 0.85; transform: scale(1.1); }
`;
const drift = keyframes`
    0%   { transform: translate(0, 0) scale(0.9); opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.6; }
    100% { transform: translate(18px, -105vh) scale(1.08); opacity: 0; }
`;
const breathe = keyframes`
    0%, 100% { opacity: 0.75; }
    50%      { opacity: 1; }
`;

export const Sea = styled.div`
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;

    html[data-theme-motion="off"] & *, html[data-page-hidden] & * { animation-play-state: paused !important; }
    @media (prefers-reduced-motion: reduce) { & * { animation: none !important; } }
`;

/** 물빛 그물 캔버스 — 반 해상도로 그린 것을 화면에 늘린다 */
export const Caustics = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: ${(p) => (p.theme.mode === "dark" ? "screen" : "normal")};
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.6 : 0.8)};
`;

/** 오른쪽 위에서 비치는 햇빛 */
export const Glare = styled.div`
    position: absolute;
    inset: -10%;
    background:
        radial-gradient(42% 32% at 82% 6%, ${(p) => (p.theme.mode === "dark" ? "rgba(140, 240, 230, 0.10)" : "rgba(255, 255, 255, 0.55)")}, transparent 70%),
        radial-gradient(30% 22% at 20% 30%, ${(p) => (p.theme.mode === "dark" ? "rgba(60, 170, 190, 0.08)" : "rgba(255, 255, 240, 0.22)")}, transparent 70%);
    animation: ${breathe} 11s ease-in-out infinite;
`;

/** 보케 — 물결에 맺힌 햇빛 점. 자리·크기·박자를 조금씩 다르게 */
const SPOTS = [
    [8, 12, 10, 0], [16, 24, 6, 2.2], [27, 9, 14, 4.1], [36, 18, 7, 1.3], [48, 7, 9, 3.4], [57, 15, 12, 0.7],
    [66, 26, 6, 5.2], [72, 10, 16, 2.8], [81, 20, 8, 1.9], [89, 8, 11, 4.6], [94, 30, 6, 0.4], [42, 32, 5, 3.0],
    [22, 40, 7, 5.6], [60, 42, 9, 2.5], [85, 44, 6, 3.9], [12, 52, 8, 1.1],
];
export const Sparks = styled.div`
    position: absolute;
    inset: 0;
    .s {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, ${(p) => (p.theme.mode === "dark" ? "rgba(160, 250, 240, 0.7)" : "rgba(255, 255, 255, 0.95)")} 0 30%, transparent 70%);
        filter: blur(0.5px);
        animation: ${twinkle} 6s ease-in-out infinite;
    }
    ${SPOTS.map(([x, y, size, delay], i) => `.s${i} { left: ${x}%; top: ${y}%; width: ${size}px; height: ${size}px; animation-delay: -${delay}s; animation-duration: ${5 + (i % 4)}s; }`).join("\n")}
`;

/** 물방울 — 아주 느리게, 띄엄띄엄 떠오른다 */
const RISERS = [[14, 42, 0], [33, 28, 9], [52, 18, 17], [71, 36, 5], [86, 22, 13], [64, 14, 21]];
export const Rising = styled.div`
    position: absolute;
    inset: 0;
    .b {
        position: absolute;
        bottom: -60px;
        opacity: 0;
        animation: ${drift} 26s linear infinite;
    }
    ${RISERS.map(([x, size, delay], i) => `.b${i} { left: ${x}%; width: ${size}px; height: ${size}px; animation-delay: -${delay}s; animation-duration: ${22 + (i % 3) * 5}s; }`).join("\n")}
    html[data-theme-motion="gentle"] & { display: none; }
`;
