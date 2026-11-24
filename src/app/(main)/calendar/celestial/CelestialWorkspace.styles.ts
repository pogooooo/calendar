import styled from 'styled-components';
import { PageWrapper } from './CelestialCalendarPage.styles';

export const Frame=styled(PageWrapper)`
    padding:4px 20px 12px;
    [data-calendar-region='day'] {
        padding:14px 14px 10px;
        border:0; outline:0; background:transparent; box-shadow:none;
    }
    [data-calendar-region='month'] { padding-bottom:6px; }
    [data-calendar-region='day'] [data-day-todo-row] {font-family:${({theme})=>theme.fonts.body};}
    @media(max-width:1250px){ [data-calendar-region='day']{padding:18px;} }
`;
