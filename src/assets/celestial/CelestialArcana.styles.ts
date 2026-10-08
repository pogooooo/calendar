import styled, { keyframes } from 'styled-components';

const revolve = keyframes`to { transform:rotate(360deg); }`;
const shimmer = keyframes`0%,100% { opacity:.65; } 50% { opacity:1; }`;
const lunar = keyframes`0%,100% { opacity:.35; transform:translateY(0); } 50% { opacity:.62; transform:translateY(-2px); }`;
const trace = keyframes`from { stroke-dashoffset:160; opacity:0; } to { stroke-dashoffset:0; opacity:.5; }`;
export const Seal = styled.svg`
    display:block; width:140px; height:auto; pointer-events:none; overflow:visible;
    color:${p=>p.theme.colors.primary}; fill:none; stroke:currentColor; stroke-width:.7;
    .engraving { opacity:.3; } .orbit { opacity:.6; transform-origin:90px 94px; animation:${revolve} 100s linear infinite; }
    .moon { fill:currentColor; stroke:none; opacity:.45; animation:${lunar} 8s ease-in-out infinite; }
    .star { fill:currentColor; stroke:none; animation:${shimmer} 6s ease-in-out infinite; }
    .constellation { opacity:.5; } .constellation path { stroke-dasharray:160; animation:${trace} 1.6s ease-out both; } .constellation circle { fill:currentColor; animation:${shimmer} 7s ease-in-out infinite; }
    text { fill:currentColor; stroke:none; font-family:${p=>p.theme.fonts.display}; font-size:8px; letter-spacing:3px; opacity:.6; }
    @media(prefers-reduced-motion:reduce) { * { animation:none; } }
`;
