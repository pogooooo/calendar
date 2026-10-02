import styled, { keyframes } from 'styled-components';
const glint = keyframes`0%,100% { opacity:.08; } 50% { opacity:.32; }`;
export const Canvas = styled.svg`position:fixed; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; fill:${p=>p.theme.colors.primary}; circle { opacity:.16; animation:${glint} 7s ease-in-out infinite; } @media(max-width:768px) { circle:nth-child(n+19) { display:none; } }`;
