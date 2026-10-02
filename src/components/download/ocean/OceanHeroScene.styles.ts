import styled, { keyframes } from 'styled-components';
const breeze = keyframes`0%,100% { translate:0 0; rotate:-6deg; } 50% { translate:0 -12px; rotate:0deg; }`;
const tide = keyframes`0%,100% { translate:-20px 0; } 50% { translate:20px 7px; }`;
export const Scene = styled.div`
    width:100%; min-height:300px; height:100%; position:relative; display:grid; place-items:center; color:${p=>p.theme.colors.primary}; overflow:hidden;
    & > svg:first-child { width:min(70%,280px); animation:${breeze} 16s ease-in-out infinite; }
    & > svg:last-child { position:absolute; bottom:0; width:120%; stroke:currentColor; stroke-width:.8; opacity:.4; animation:${tide} 13s ease-in-out infinite; }
`;
