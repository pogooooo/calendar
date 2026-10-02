import styled from 'styled-components';
export const Tide = styled.div<{ $tier:number; $left?:boolean; $right?:boolean }>`
    position:absolute; inset:0; pointer-events:none; overflow:hidden;
    border-radius:${p=>p.$left?'0':'9px'} ${p=>p.$right?'0':'9px'} 0 0;
    svg { position:absolute; bottom:0; width:100%; height:${p=>12+Math.min(p.$tier,3)*5}px; fill:${p=>p.theme.colors.primary}; opacity:${p=>.06+Math.min(p.$tier,3)*.025}; }
`;
