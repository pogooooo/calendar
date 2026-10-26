import styled, { css } from 'styled-components';
import * as C from '../celestial/CelestialWeekStrip.styles';
import { gemstoneNumeral, mineralSurface, gemControl } from '../../monthCalendar/gem/GemCalendarMaterial.styles';

export * from '../celestial/CelestialWeekStrip.styles';

export const Strip = styled(C.Strip)`
    ${mineralSurface}
    border-radius:8px; padding:5px 5px 7px;
`;
export const Head = styled(C.Head)`
    .title { font-family:${p => p.theme.fonts.display}; font-size:.95rem; letter-spacing:0; }
    :where(html[data-theme-motion="gentle"]) & .title { animation:none; }
    button { border-radius:5px; color:${p => p.theme.colors.primary}; }
    .today { ${gemControl} min-height:29px; font-family:${p => p.theme.fonts.body}; font-size:.6rem; letter-spacing:.03em; }
    button:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:1px; }
`;
export const Days = styled(C.Days)`gap:3px;`;
export const Day = styled(C.Day)`
    min-height:72px; padding:7px 0 5px; gap:5px; border-radius:6px 2px;
    background:${p => p.$selected ? `linear-gradient(135deg,${p.theme.colors.primary}12,${p.theme.colors.primary}04)` : 'transparent'};
    border-color:${p => p.$selected ? `${p.theme.colors.primary}55` : 'transparent'};
    .name { font-family:${p => p.theme.fonts.body}; font-size:.57rem; letter-spacing:.04em; }
    .num { width:30px; height:29px; line-height:29px; border:0; border-radius:0; font-family:${p => p.theme.fonts.numeral}; font-size:1.04rem; }
    ${p => p.$today && css`.num { ${gemstoneNumeral} width:30px; height:29px; }`}
    .dots i { width:5px; height:6px; transform:none; border-radius:0; clip-path:polygon(25% 0,75% 0,100% 35%,50% 100%,0 35%); }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-1px; }
    :where(html:not([data-theme-motion="off"])) & { transition:background .22s ease,border-color .22s ease,box-shadow .22s ease; }
    &:hover { box-shadow:inset 0 1px 0 ${p => p.theme.colors.accent}60; }
`;
