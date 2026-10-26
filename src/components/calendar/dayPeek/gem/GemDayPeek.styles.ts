import styled from 'styled-components';
import * as C from '../celestial/CelestialDayPeek.styles';

export * from '../celestial/CelestialDayPeek.styles';

export const Wrap = styled(C.Wrap)`
    margin-top:10px; padding:0 3px;
`;
export const Head = styled(C.Head)`
    min-height:42px; letter-spacing:.015em; font-family:${p => p.theme.fonts.body}; font-size:.74rem; font-weight:600;
    .hd { width:8px; height:11px; transform:none; border:0; clip-path:polygon(25% 0,75% 0,100% 30%,80% 85%,50% 100%,20% 85%,0 30%); background:linear-gradient(135deg,${p => p.theme.colors.accent},${p => p.theme.gemColor ?? p.theme.colors.primary}); }
    .hr { background:linear-gradient(90deg,${p => p.theme.colors.accent}60,transparent); }
    .open { font-size:.65rem; font-weight:400; letter-spacing:0; }
    b { font-family:${p => p.theme.fonts.numeral}; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-2px; }
`;
export const Row = styled(C.Row)`
    gap:10px; padding-left:3px; border-bottom-color:${p => p.theme.colors.border}; font-size:.79rem;
    :where(html[data-theme-motion="gentle"]) & { animation:none; }
    .mark { width:7px; height:9px; transform:none; border:0; clip-path:polygon(25% 0,75% 0,100% 30%,50% 100%,0 30%); background:${p => p.theme.colors.primary}; opacity:${p => p.$done ? .45 : .8}; }
    em { font-family:${p => p.theme.fonts.numeral}; font-size:.67rem; letter-spacing:0; }
    &:hover { background:${p => p.theme.colors.primary}06; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-2px; }
`;
export const Empty = styled(C.Empty)`
    line-height:1.75; padding:12px 3px; font-size:.76rem;
`;
