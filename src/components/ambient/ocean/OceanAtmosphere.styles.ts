/**
 * 바다 바탕 장면의 모양 — 물빛 캔버스와 고운 결 한 겹.
 */
import styled from "styled-components";

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
