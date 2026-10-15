import { createGlobalStyle } from "styled-components";
import { withAlpha } from "@/styles/color";

/**
 * Maple 의 종이 바탕.
 *
 * 따뜻한 종이색 위에 아주 옅은 빛 두 군데(오른쪽 위 호박빛, 왼쪽 아래 단풍빛)와 고운 종이 섬유를 한 겹 얹는다.
 * 2026-10-15 다시 그리며 비네트(가장자리 그늘)를 걷고 섬유를 반쯤으로 줄였다 — 화면이 바래고 흐려 보였다.
 * 섬유는 맨 위에 고정된 한 장(손가락·마우스는 통과)이라 패널·카드가 저마다 바탕을 칠해도 같은 결이 보인다.
 * 잡음은 SVG feTurbulence 라 그림 파일이 필요 없다.
 *
 * 데스크톱 위젯 창은 창 바깥이 투명이라 여기서 뺀다. 스크롤 막대도 여기서 Maple 의 것(둥근 막대)으로 바꾼다.
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
        background-image: ${(p) => p.theme.mode === "dark"
            ? `radial-gradient(ellipse at 100% 0%, ${p.theme.colors.primary}14, transparent 46%)`
            : `radial-gradient(ellipse at 100% 0%, ${p.theme.colors.accent}26, transparent 50%),
            radial-gradient(ellipse at 0% 100%, ${p.theme.colors.primary}0F, transparent 46%)`};
    }

    body::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483647;
        background-image: ${(p) => p.theme.mode === "dark" ? GRAIN(0.95, 0.85, 0.7) : GRAIN(0.3, 0.2, 0.14)};
        opacity: ${(p) => p.theme.mode === "dark" ? 0.08 : 0.1};
    }

    html:has([data-widget]) body::after {
        display: none;
    }

    /* 스크롤 막대 — 눈금자(GlobalScrollbar) 대신 둥근 막대 하나. 트랙은 비운다 */
    @media (hover: hover) {
        html *::-webkit-scrollbar-track {
            background-image: none;
            border: none;
        }
        html *::-webkit-scrollbar-thumb {
            border: 3px solid transparent;
            border-radius: 999px;
            background-clip: padding-box;
            background-color: ${(p) => withAlpha(p.theme.colors.text, p.theme.mode === "dark" ? 0.24 : 0.2)};
        }
        html *::-webkit-scrollbar-thumb:hover {
            box-shadow: none;
            background-color: ${(p) => withAlpha(p.theme.colors.text, 0.36)};
        }
    }
`;

export default MapleGround;
