/**
 * CelestialSidebarDesign 의 모양 — 경계에 꿰인 천체 기둥.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 선·점선·채움·궤도의 붓은 문양 모음(ornamentStrokes)과 같다. 행성은 고리마다 다른 빠르기로 돈다.
 */
import styled, { keyframes, css } from "styled-components";
import { withAlpha } from "@/styles/color";
import { ornamentStrokes } from "@/components/ornament/celestial/CelestialOrnaments.styles";

const twinkle = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
`;

export const AnimatedSvg = styled.svg<{ $hovered?: boolean }>`
    /* 그림 전체가 이 색을 쓴다(SVG 는 currentColor). 테마가 바뀌면 그림도 따라 바뀐다. */
    color: ${(p) => p.theme.colors.primary};
    overflow: visible;
    ${ornamentStrokes}
    filter: none;
    transition: filter 0.35s ease;

    .axis { stroke-opacity: 0.9; }
    .sun { opacity: 0.95; }
    .o1 { --orbit: 38s; }
    .o2 { --orbit: 70s; }
    .o3 { --orbit: 120s; }
    .o4 { --orbit: 46s; }
    .o5 { --orbit: 30s; }

    /* 기기의 동작 줄이기는 data-theme-motion 이 담는다 (ThemeProviderWrapper·첫 그림 스크립트) */
    html:not([data-theme-motion="off"]) & .twinkle { animation: ${twinkle} 5.5s ease-in-out infinite; }
    html:not([data-theme-motion="off"]) & .twinkle:nth-of-type(2n) { animation-duration: 7s; animation-delay: -2s; }

    ${(p) => p.$hovered && css`
        filter: drop-shadow(0 0 3px ${withAlpha(p.theme.colors.primary, 0.75)});
    `}
`;
