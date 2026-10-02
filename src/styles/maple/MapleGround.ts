import { createGlobalStyle } from "styled-components";

/**
 * Maple 의 종이결.
 *
 * 화면 위에 얇은 잡음(종이 섬유)과 가장자리 그늘(오래된 종이의 비네트)을 한 겹 얹는다.
 * 패널·모달·사이드바가 저마다 바탕색을 칠하므로 body 배경으로는 종이가 안 보인다 —
 * 그래서 맨 위에 고정된 한 장으로 얹고, 손가락·마우스는 그대로 통과시킨다.
 * 잡음은 SVG feTurbulence 라 그림 파일이 필요 없고 어느 크기에서도 결이 같다.
 *
 * 데스크톱 위젯 창은 창 바깥이 투명이라 여기서 빼고, WidgetShell 이 제 종이(G1·G2)를 깐다.
 */
const GRAIN = (r: number, g: number, b: number) =>
    `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>` +
        `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
        `<feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0.9 0 0 0 -0.25'/></filter>` +
        `<rect width='100%' height='100%' filter='url(#g)'/></svg>`,
    )}")`;

const MapleGround = createGlobalStyle`
    [data-app-shell] {
        background-image: ${(p) => p.theme.mode === "dark" ? "none" : `
            radial-gradient(ellipse at 100% 0%, ${p.theme.colors.accent}1C, transparent 50%),
            radial-gradient(ellipse at 0% 100%, ${p.theme.colors.primary}0C, transparent 48%)`};
    }

    body::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483647;
        background-image:
            ${(p) => p.theme.mode === "dark"
                ? "radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0, 0, 0, 0.32) 100%)"
                : "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(59, 42, 32, 0.10) 100%)"},
            ${(p) => p.theme.mode === "dark" ? GRAIN(0.95, 0.85, 0.7) : GRAIN(0.28, 0.18, 0.12)};
        opacity: ${(p) => p.theme.mode === "dark" ? 0.16 : 0.22};
    }

    html:has([data-widget]) body::after {
        display: none;
    }
`;

export default MapleGround;
