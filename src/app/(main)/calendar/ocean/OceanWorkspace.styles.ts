import styled from 'styled-components';
import { PageWrapper } from './OceanCalendarPage.styles';
import { surface } from '@/styles/ocean/water';

export const Frame=styled(PageWrapper)`
    padding:4px 8px 18px;
    [data-calendar-region='month'] {
        ${surface('panel')}
        border-radius:22px 22px 10px 10px;padding:18px 22px 12px;
        min-height:600px;flex:1 0 600px !important;
    }
    [data-calendar-region='day'] {
        ${surface('card')}
        border-radius:10px 10px 20px 20px;
        &:not([data-collapsed]) {flex-basis:clamp(220px,24vh,300px) !important;}
    }
    [data-month-cell] .day-number {font-size:.86rem;}
    [data-calendar-region='month'] [data-month-grid] {background:transparent;min-height:420px;}
    @media(max-width:1250px){[data-calendar-region='month']{padding:16px;}[data-calendar-region='day']:not([data-collapsed]){min-height:260px;}}
`;
