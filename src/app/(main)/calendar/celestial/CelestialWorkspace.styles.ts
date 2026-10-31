import styled from 'styled-components';
import { PageWrapper } from './CelestialCalendarPage.styles';

export const Frame=styled(PageWrapper)`
    padding:4px 20px 12px;
    [data-calendar-region='day'] {
        padding:14px 14px 10px;
        border:0; outline:0; background:transparent; box-shadow:none;
    }
    [data-calendar-region='month'] { padding-bottom:6px; }
    [data-calendar-region='day'][data-collapsed] {padding:0;outline:none;background:transparent;}
    [data-calendar-region='month'] [data-month-grid] {min-height:480px;}
    [data-calendar-region='day'] [data-day-todo-row] {font-family:${({theme})=>theme.fonts.body};}
    @media(max-width:1250px){ [data-calendar-region='day']{padding:18px;} }
    @media(min-width:1251px) and (max-height:820px){
        height:auto;[data-calendar-region='month'],[data-calendar-region='day']{height:580px;}
    }
`;
