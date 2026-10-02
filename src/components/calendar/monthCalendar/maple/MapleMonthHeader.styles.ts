import styled from 'styled-components';
import { DateRangeDisplay } from './MapleMonthCalendar.styles';
export const Bookmark = styled.div`
    display:flex; align-items:center; gap:14px; width:100%; flex:none; margin-bottom:12px;
    @media(max-width:768px) { gap:6px; }
    [data-widget] & { margin-bottom:4px; gap:6px; }
`;
export const Index = styled.div`display:flex; flex:none;`;
export const FolioNavigation = styled(DateRangeDisplay)`width:auto; flex:1; margin:0; justify-content:flex-end; gap:8px; [data-widget] & { margin:0; }`;
