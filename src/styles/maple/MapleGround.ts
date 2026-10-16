import { createGlobalStyle, css } from "styled-components";
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
 *
 * 종이색과 빛은 html 에만 칠하고 body·앱 껍데기는 비운다(바다와 같은 까닭) — 단풍 장면(MapleAtmosphere)이 내용 뒤
 * z-index:-1 에 깔리므로, 껍데기가 칠해져 있으면 그 면이 장면을 통째로 덮는다.
 * 위젯 창은 html:has([data-widget]) 의 투명(globals.css, 더 좁은 규칙)이 이긴다.
 */
const GRAIN = (r: number, g: number, b: number) =>
    `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>` +
        `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
        `<feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0.9 0 0 0 -0.25'/></filter>` +
        `<rect width='100%' height='100%' filter='url(#g)'/></svg>`,
    )}")`;

/**
 * 빈티지 벌의 종이 얼룩 — 아주 낮은 주파수의 잡음을 밤빛으로 물들여 종이가 고르지 않게 바랜 결(군데군데 짙고 옅음)
 */
const MOTTLE = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>` +
    `<filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.0045' numOctaves='3' seed='7' stitchTiles='stitch'/>` +
    `<feColorMatrix values='0 0 0 0 0.47 0 0 0 0 0.32 0 0 0 0 0.15 0 0 1.1 0 -0.56'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#m)'/></svg>`,
)}")`;

/**
 * 빈티지 벌의 바탕 — 오래 둔 종이: 가장자리로 갈수록 짙게 바랜 그늘, 군데군데 갈색 얼룩(여우 얼룩), 고르지 않은 바램.
 * 맨 위의 섬유(body::after)도 조금 굵게. 카드는 cardShadow 가 안쪽 테를 바랜다(ink.ts).
 */
const vintageGround = (p: { theme: { colors: { accent: string; primary: string } } }) => [
    "radial-gradient(ellipse 75% 70% at 50% 46%, transparent 58%, rgba(112, 74, 32, 0.2) 100%)",
    "radial-gradient(circle at 7% 12%, rgba(140, 92, 42, 0.13), rgba(140, 92, 42, 0.05) 2.2%, transparent 5%)",
    "radial-gradient(circle at 93% 86%, rgba(140, 92, 42, 0.12), rgba(140, 92, 42, 0.04) 2%, transparent 4.5%)",
    "radial-gradient(circle at 84% 7%, rgba(140, 92, 42, 0.09), transparent 3%)",
    "radial-gradient(circle at 3% 72%, rgba(140, 92, 42, 0.08), transparent 3.4%)",
    `${MOTTLE} 0 0 / 900px 900px`,
    `radial-gradient(ellipse at 100% 0%, ${withAlpha(p.theme.colors.accent, 0.16)}, transparent 50%)`,
].join(", ");

const MapleGround = createGlobalStyle`
    html {
        ${(p) => (p.theme.variant === "vintage"
            ? css`
                background: ${vintageGround(p)}, ${p.theme.colors.background} !important;
            `
            : css`
                background-color: ${p.theme.colors.background} !important;
                background-image: ${p.theme.mode === "dark"
                    ? `radial-gradient(ellipse at 100% 0%, ${p.theme.colors.primary}14, transparent 46%)`
                    : `radial-gradient(ellipse at 100% 0%, ${p.theme.colors.accent}26, transparent 50%),
                    radial-gradient(ellipse at 0% 100%, ${p.theme.colors.primary}0F, transparent 46%)`} !important;
            `)}
        background-attachment: fixed !important;
    }
    body { background: transparent !important; }
    [data-app-shell] { background: transparent !important; }

    body::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483647;
        background-image: ${(p) => p.theme.mode === "dark" ? GRAIN(0.95, 0.85, 0.7) : p.theme.variant === "vintage" ? GRAIN(0.36, 0.24, 0.12) : GRAIN(0.3, 0.2, 0.14)};
        opacity: ${(p) => p.theme.mode === "dark" ? 0.08 : p.theme.variant === "vintage" ? 0.16 : 0.1};
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
