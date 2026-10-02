import styled, { keyframes } from 'styled-components';
const wave = keyframes`0%,100% { translate:0 0; } 50% { translate:5px 0; }`;
const glint = keyframes`0%,100% { opacity:.3; } 50% { opacity:.75; }`;
export const Coast = styled.div<{ $hovered:boolean }>`
    position:relative; width:160px; height:100%; color:${p=>p.theme.colors.primary};
    & > svg:first-child { width:160px; height:100%; overflow:visible; stroke:currentColor; stroke-width:.8; }
    .shore { opacity:.3; } .foam { opacity:${p=>p.$hovered ? .65 : .15}; animation:${wave} 11s ease-in-out infinite; }
    .pearl { fill:currentColor; stroke:none; animation:${glint} 8s ease-in-out infinite; }
    .shell { position:absolute; width:105px; left:48px; top:125px; rotate:-15deg; }
`;
