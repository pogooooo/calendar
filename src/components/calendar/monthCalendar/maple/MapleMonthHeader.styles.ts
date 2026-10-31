import styled from 'styled-components';
import { DateRangeDisplay } from './MapleMonthCalendar.styles';
import { hair } from '@/styles/maple/ink';

/** A dated notebook page, with a small running header and generous writing space. */
export const Bookmark = styled.header`
    display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px 16px;
    width:100%; box-sizing:border-box; flex:none; padding:18px 12px 17px 26px;
    position:relative; background:transparent;
    &::before { content:""; position:absolute; left:15px; top:16px; bottom:0; width:1px; background:${p => p.theme.colors.primary}40; box-shadow:3px 0 0 ${p => p.theme.colors.primary}0D; }
    border:0; border-radius:0; box-shadow:none;
    @media(max-width:768px) { padding:4px 4px 6px 16px; gap:4px; &::before { left:6px; top:4px; } }
    [data-widget] & { display:flex; padding:0 6px; border:0; background:transparent; box-shadow:none; &::before { display:none; } }
`;
export const MonthIndex = styled.div`
    grid-column:1 / -1; display:flex; justify-content:space-between; align-items:center;
    padding-bottom:10px; border-bottom:1px solid ${p => hair(p.theme,.15)};
    color:${p => p.theme.colors.primary}; font-family:${p => p.theme.fonts.body};
    font-size:.61rem; font-weight:650; letter-spacing:.18em;
    span { color:${p => p.theme.colors.textSecondary}; font-size:.6rem; letter-spacing:.08em; font-variant-numeric:tabular-nums; font-weight:450; }
    @media(max-width:768px) { padding-bottom:5px; font-size:.58rem; }
    [data-widget] & { display:none; }
`;

export const MonthTrack = styled.div`
    grid-column:1 / -1; display:grid; grid-template-columns:repeat(12,1fr); gap:2px; margin-top:-4px;
    font-family:${p => p.theme.fonts.body}; font-size:.61rem; letter-spacing:.04em; font-variant-numeric:tabular-nums;
    span { padding:0 0 6px; text-align:center; color:${p => p.theme.colors.textSecondary}; border-bottom:1px solid ${p => hair(p.theme,.12)}; }
    .active { color:${p => p.theme.colors.primary}; font-weight:750; border-bottom:2px solid ${p => p.theme.colors.primary}; }
    @media(max-width:768px) { display:none; }
    [data-widget] & { display:none; }
`;
export const FolioNavigation = styled(DateRangeDisplay)`
    width:auto; margin:0; gap:4px; min-width:0; justify-content:flex-start;
    && { font-size:1.35rem; font-weight:500; }
    & > div { order:-1; margin-right:16px; }
    .nav-btn { width:30px; height:32px; border:0; background:transparent; border-radius:3px; }
    :where(html:not([data-theme-motion="off"])) & .nav-btn svg { transition:translate .18s ease; }
    .nav-btn:first-child:hover svg { translate:-2px 0; }
    .nav-btn:nth-of-type(2):hover svg { translate:2px 0; }
    @media(max-width:768px) { && { font-size:1.12rem; } & > div { margin-right:auto; } .nav-btn { width:26px; } }
    @media(max-width:360px) {
        && { font-size:.9rem; gap:1px; flex-wrap:nowrap; }
        & > div { margin-right:2px; }
        .nav-btn { min-width:32px; min-height:40px; }
        & > button:last-child { padding:0 8px; margin-left:2px; font-size:.7rem; }
    }
    [data-widget] & { flex:1; && { font-size:.85rem; gap:2px; } & > div { margin-right:4px; } }
`;
export const Index = styled.div`display:flex; align-items:center; justify-content:flex-end;`;
