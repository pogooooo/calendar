import { css } from 'styled-components';
import { star4Mark } from './ornaments';

/** The calendar shares the surrounding sky without a separate tinted sheet. */
export const astralSurface = css`
    background-color:transparent;
    background-image:none;
`;

/** An engraved date, with a gold rule and a north star; no filled badge. */
export const todayNumeral = css`
    position:relative; display:inline-flex; align-items:center; justify-content:flex-start;
    box-sizing:border-box; min-width:0; width:auto; height:26px; margin:0; padding:0 11px 3px 1px;
    border:0; border-radius:0; background:none; background-image:none;
    box-shadow:none; text-shadow:none; color:${p => p.theme.colors.text}; font-weight:750;
    &::before {
        content:""; position:absolute; top:4px; right:0;
        ${star4Mark('6px')}
        color:${p => p.theme.colors.primary}; pointer-events:none;
    }
    &::after {
        content:""; position:absolute; left:1px; right:11px; bottom:1px; height:2px;
        background:linear-gradient(90deg,${p => p.theme.colors.primary},${p => p.theme.colors.accent});
        pointer-events:none;
    }
`;
