import styled, { keyframes } from 'styled-components';
const gleam = keyframes`0%,100% { opacity:.5; } 50% { opacity:1; }`;
const rise = keyframes`from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); }`;
export const Shell = styled.svg`
    display:block; width:140px; height:auto; color:${p=>p.theme.colors.primary}; fill:none; stroke:currentColor; stroke-width:.8; pointer-events:none;
    .body { opacity:.7; } .ribs { opacity:.35; } .pearl { fill:currentColor; stroke:none; animation:${gleam} 7s ease-in-out infinite; }
    .wash { opacity:.3; } animation:${rise} .7s ease-out both;
`;
