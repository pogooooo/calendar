import styled, { keyframes } from 'styled-components';
import { ornamentStrokes } from '@/components/ornament/celestial/CelestialOrnaments.styles';

const shimmer = keyframes`0%,100% { opacity:.5; } 50% { opacity:1; }`;

/** 혼천의 인장 — 문양의 붓(ornamentStrokes)에 옅기만 더한다 */
export const Seal = styled.svg`
    display:block; width:140px; height:auto; pointer-events:none; overflow:visible;
    color:${p=>p.theme.colors.primary};
    ${ornamentStrokes}
    .engraving { opacity:.45; }
    .orbits { --orbit: 90s; opacity:.75; }
    .phases { opacity:.75; }
    text { fill:currentColor; stroke:none; font-family:${p=>p.theme.fonts.display}; font-size:8px; letter-spacing:3px; opacity:.6; }
    html:not([data-theme-motion="off"]) & .twinkle { animation:${shimmer} 6s ease-in-out infinite; }
`;
