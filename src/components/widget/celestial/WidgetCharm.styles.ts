import styled from 'styled-components';
import type { ComponentType } from 'react';
export const Charm = styled.div`
    position:absolute; width:48px; height:48px; right:8px; bottom:8px; z-index:0; pointer-events:none; color:${p=>p.theme.colors.primary}; opacity:.12;
    /* 움직이지 않는다 — 위젯은 투명 창이라, 끝없이 도는 장식이 창 전체를 쉬지 않고 다시 칠하게 해 깜빡였다 */
    svg { width:100%; height:100%; stroke:currentColor; stroke-width:.7; }
    @media(max-height:180px),(max-width:260px) { display:none; }
`;
/** JSX stays in the theme component through a small intrinsic styled path. */
export const Shape = styled.path.attrs({d:'M30 6a24 24 0 1 0 0 48 24 24 0 1 0 0-48M30 12v6m0 24v6M12 30h6m24 0h6M30 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z'})`` as ComponentType;
