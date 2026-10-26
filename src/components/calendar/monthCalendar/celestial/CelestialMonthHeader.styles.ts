import styled from 'styled-components';
import { DateRangeDisplay } from './CelestialMonthCalendar.styles';

export const SkyHeader = styled.div`
    display:flex; align-items:center; gap:16px; width:100%; flex:none; min-height:48px; margin-bottom:16px;
    .header-star { flex:none; color:${p => p.theme.colors.primary}; opacity:.65; }
    [data-widget] & { min-height:0; margin-bottom:4px; gap:6px; .header-star { display:none; } }
    @media(max-width:768px) { gap:4px; .header-star { display:none; } }
`;
export const Navigation = styled(DateRangeDisplay)`
    width:auto; flex:1; margin:0; gap:10px; letter-spacing:.025em; font-size:1.22rem; font-weight:500;
    .nav-btn { width:32px; height:36px; flex:none; border-radius:3px; }
    .nav-btn:hover { transform:none; background:${p => p.theme.colors.primary}12; }
    & > button:last-child { margin-left:8px; padding:6px 12px; font-family:${p => p.theme.fonts.body}; font-size:.72rem; letter-spacing:.02em; border-radius:3px; }
    .nav-btn:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:1px; }
    @media(max-width:768px) { && { gap:3px; font-size:1rem; letter-spacing:0; flex-wrap:nowrap; } & > button:last-child { margin-left:3px; } }
    :where(html:not([data-theme-motion="off"])) & .nav-btn svg { transition:translate .2s ease; }
    .nav-btn:first-child:hover svg { translate:-2px 0; }
    .nav-btn:nth-of-type(2):hover svg { translate:2px 0; }
    @media(max-width:360px) {
        && { gap:1px; letter-spacing:0; font-size:.9rem; }
        .nav-btn { padding:0; min-width:32px; }
        & > button:last-child { padding:4px 6px; font-size:.62rem; letter-spacing:0; }
    }
    [data-widget] & { margin:0; font-size:.85rem; .nav-btn { width:24px; height:28px; } }
`;
export const Filters = styled.div`display:flex; align-items:center; flex:none;`;

export const Phases = styled.svg`
    flex:0 1 170px; width:170px; height:22px; color:${p => p.theme.colors.primary}; opacity:1;
    .line { fill:none; stroke:currentColor; stroke-width:.8; } .fill { fill:currentColor; stroke:none; }
    @media(max-width:1000px) { display:none; }
    [data-widget] & { display:none; }
`;
