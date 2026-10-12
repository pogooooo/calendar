/**
 * 바다 바탕 장면의 모양 — 물빛 캔버스와 고운 결 한 겹.
 */
import styled, { keyframes } from "styled-components";

export const Sea = styled.div`
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
`;

/** 물빛 그물 캔버스 — 반 해상도로 그린 것을 화면에 늘린다 */
export const Caustics = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
`;

const flowA = keyframes`from { background-position: 0 0, 0 0; } to { background-position: 640px 320px, -520px 390px; }`;
const flowB = keyframes`from { background-position: 0 0, 0 0; } to { background-position: -560px 280px, 600px -300px; }`;

/**
 * WebGL 이 없을 때의 물빛 — 물(three.js)이 서지 못하면 바닥 그라데이션만 멈춰 남았다("필터가 안 움직인다").
 * 옅은 빛 무늬 두 겹이 서로 다른 쪽으로 천천히 흘러 물 위 햇빛처럼 일렁인다. 움직임 '끄기'면 멈추고, '잔잔하게'면 더 느리다.
 */
export const FlatWater = styled.div`
    position: absolute;
    inset: 0;
    mix-blend-mode: ${(p) => (p.theme.mode === "dark" ? "screen" : "soft-light")};
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.32 : 0.75)};

    &::before, &::after {
        content: "";
        position: absolute;
        inset: 0;
        background-repeat: repeat;
    }
    &::before {
        background-image:
            radial-gradient(ellipse 150px 46px at 30% 42%, rgba(255, 255, 255, 0.5), transparent 70%),
            radial-gradient(ellipse 110px 60px at 72% 68%, rgba(255, 255, 255, 0.36), transparent 70%);
        background-size: 640px 320px, 520px 390px;
        animation: ${flowA} 46s linear infinite;
    }
    &::after {
        background-image:
            radial-gradient(ellipse 90px 34px at 58% 28%, rgba(255, 255, 255, 0.42), transparent 70%),
            radial-gradient(ellipse 170px 52px at 18% 76%, rgba(255, 255, 255, 0.3), transparent 70%);
        background-size: 560px 280px, 600px 300px;
        animation: ${flowB} 63s linear infinite;
    }
    html[data-theme-motion="gentle"] &::before, html[data-theme-motion="gentle"] &::after { animation-duration: 120s; }
    html[data-theme-motion="off"] &::before, html[data-theme-motion="off"] &::after { animation: none; }
`;

/** 고운 결 — 사진 같은 촉감만 아주 옅게 */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.55'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;
export const Grain = styled.div`
    position: absolute;
    inset: 0;
    background-image: ${GRAIN};
    background-size: 160px 160px;
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.07 : 0.05)};
    mix-blend-mode: ${(p) => (p.theme.mode === "dark" ? "screen" : "multiply")};
`;
