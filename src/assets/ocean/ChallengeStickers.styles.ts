import styled, { keyframes } from 'styled-components';
const collect = keyframes`0% { scale:.8; opacity:.4; } 65% { scale:1.08; } 100% { scale:1; opacity:1; }`;
export const Sticker = styled.svg<{ $filled:boolean }>`
    width:52px; height:52px; overflow:visible; fill:${p=>p.$filled?p.theme.colors.primary+'22':'none'}; stroke:currentColor; stroke-width:1;
    circle { fill:currentColor; } animation:${collect} .45s ease-out both;
`;
