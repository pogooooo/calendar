import styled, { keyframes } from 'styled-components';
import type { ComponentType } from 'react';
const turn = keyframes`to { rotate:360deg; }`;
export const Charm = styled.div`
    position:absolute; width:48px; height:48px; right:8px; bottom:8px; z-index:0; pointer-events:none; color:${p=>p.theme.colors.primary}; opacity:.12;
    svg { width:100%; height:100%; stroke:currentColor; stroke-width:.7; animation:${turn} 90s linear infinite; }
    html[data-theme-motion="gentle"] & svg { animation:none; }
    @media(max-height:180px),(max-width:260px) { display:none; }
`;
/** JSX stays in the theme component through a small intrinsic styled path. */
export const Shape = styled.path.attrs({d:'M30 6a24 24 0 1 0 0 48 24 24 0 1 0 0-48M30 12v6m0 24v6M12 30h6m24 0h6M30 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z'})`` as ComponentType;
