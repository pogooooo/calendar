import styled, { keyframes } from 'styled-components';
const tide = keyframes`0%,100% { translate:-25px 0; } 50% { translate:25px 5px; }`;
export const Panel = styled.div`
    position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:35px; overflow:hidden;
    color:${p=>p.theme.colors.primary}; background:${p=>p.theme.colors.background};
    & > svg:first-child { width:230px; } h1 { font-size:2.6rem; font-weight:300; letter-spacing:.25em; }
    & > svg:last-child { position:absolute; bottom:0; width:120%; height:140px; fill:currentColor; opacity:.13; pointer-events:none; }
    & > svg:last-child path { animation:${tide} 18s ease-in-out infinite; } & > svg:last-child path:last-child { opacity:.4; animation-direction:reverse; }
    @media(max-width:768px) { display:none; }
`;
