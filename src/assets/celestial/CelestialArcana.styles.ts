import styled, { keyframes } from 'styled-components';

const revolve = keyframes`to { transform:rotate(360deg); }`;
const shimmer = keyframes`0%,100% { opacity:.65; } 50% { opacity:1; }`;
export const Seal = styled.svg`
    display:block; width:140px; height:auto; pointer-events:none; overflow:visible;
    color:${p=>p.theme.colors.primary}; fill:none; stroke:currentColor; stroke-width:.7;
    .engraving { opacity:.3; } .orbit { opacity:.6; transform-origin:90px 94px; animation:${revolve} 100s linear infinite; }
    .moon { fill:currentColor; stroke:none; opacity:.45; }
    .star { fill:currentColor; stroke:none; animation:${shimmer} 6s ease-in-out infinite; }
    .constellation { opacity:.5; } .constellation circle { fill:currentColor; }
    text { fill:currentColor; stroke:none; font-family:${p=>p.theme.fonts.display}; font-size:8px; letter-spacing:3px; opacity:.6; }
    @media(prefers-reduced-motion:reduce) { .orbit,.star { animation:none; } }
`;
