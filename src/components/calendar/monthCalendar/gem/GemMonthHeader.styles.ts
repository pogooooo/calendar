import styled from 'styled-components';
import { DateRangeDisplay } from './GemMonthCalendar.styles';

export const Header = styled.div`
    display:flex; align-items:center; gap:11px; width:100%; min-width:0; min-height:60px; margin-bottom:13px; flex-shrink:0;
    @media(max-width:768px) { gap:5px; min-height:42px; margin-bottom:8px; }
    [data-widget] & { gap:5px; min-height:28px; margin-bottom:5px; }
`;
export const Emblem = styled.svg`
    width:36px; height:36px; flex:none; overflow:visible;
    .setting { fill:${p => p.theme.colors.accent}0D; stroke:${p => p.theme.colors.accent}; stroke-width:.8; }
    .stone { fill:${p => p.theme.gemColor ?? p.theme.colors.primary}28; stroke:${p => p.theme.colors.primary}80; stroke-width:.7; }
    .facets { fill:none; stroke:${p => p.theme.colors.primary}; stroke-width:.65; opacity:.75; }
    .claws { fill:none; stroke:${p => p.theme.colors.accent}; stroke-width:2; stroke-linecap:round; }
    :where(html:not([data-theme-motion="off"])) & { transition:filter .4s ease,rotate .6s cubic-bezier(.2,.8,.2,1); }
    ${Header}:hover & { filter:drop-shadow(0 0 5px ${p => p.theme.gemColor ?? p.theme.colors.primary}55); }
    :where(html[data-theme-motion="full"]) ${Header}:hover & { rotate:8deg; }
    @media(max-width:768px) { width:27px; height:27px; }
    @media(max-width:360px) { display:none; }
    [data-widget] & { width:24px; height:24px; }
`;
export const Navigation = styled(DateRangeDisplay)`
    flex:none; width:auto; min-width:0; gap:7px; margin:0; white-space:nowrap;
    .nav-btn { width:29px; height:31px; flex:none; }
    .nav-btn svg { width:19px; height:19px; }
    :where(html:not([data-theme-motion="off"])) & .nav-btn svg { transition:translate .2s ease; }
    :where(html[data-theme-motion="full"]) & .nav-btn:first-child:hover svg { translate:-2px 0; }
    :where(html[data-theme-motion="full"]) & .nav-btn:nth-of-type(2):hover svg { translate:2px 0; }
    @media(max-width:768px) { && { flex:1; gap:2px; flex-wrap:nowrap; font-size:1rem; letter-spacing:-.035em; } .nav-btn { width:25px; padding:0; } & > button:last-child { padding:3px 7px; font-size:.62rem; } }
    [data-widget] & { flex:1; font-size:.87rem; gap:3px; .nav-btn { width:24px; height:26px; } }
`;
export const DateComposition = styled.div`display:flex; align-items:center; flex:none;`;
export const CatalogueDate = styled.div`
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; padding:0 5px;
    small { font-family:${p => p.theme.fonts.body}; font-size:.62rem; font-weight:500; letter-spacing:.14em; color:${p => p.theme.colors.textSecondary}; }
    .month { font-family:${p => p.theme.fonts.display}; font-size:2.25rem; font-weight:500; letter-spacing:-.05em; line-height:1.1; color:${p => p.theme.colors.text}; }
    .month > div { height:1.18em; }
    @media(max-width:768px) { display:none; }
    [data-widget] & { display:none; }
`;
export const CompactDate = styled.div`
    display:none;
    @media(max-width:768px) { display:block; }
    [data-widget] & { display:block; }
`;
export const Separator = styled.div`
    height:1px; min-width:8px; flex:1; background:linear-gradient(90deg,${p => p.theme.colors.accent}80,${p => p.theme.colors.accent}10);
    @media(max-width:768px) { display:none; }
`;
export const Filters = styled.div`display:flex; align-items:center; flex:none;`;
