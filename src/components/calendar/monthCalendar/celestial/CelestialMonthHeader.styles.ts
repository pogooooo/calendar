import styled from 'styled-components';
import { DateRangeDisplay } from './CelestialMonthCalendar.styles';
export const SkyHeader = styled.div`
    display:flex; align-items:center; gap:12px; width:100%; flex:none; margin-bottom:10px;
    & > svg { width:40px; height:40px; }
    [data-widget] & { margin-bottom:4px; gap:6px; & > svg { display:none; } }
    @media(max-width:768px) { gap:4px; & > svg { display:none; } }
`;
export const Navigation = styled(DateRangeDisplay)`width:auto; flex:1; margin:0; gap:8px; [data-widget] & { margin:0; }`;
export const Filters = styled.div`display:flex; align-items:center; flex:none;`;
