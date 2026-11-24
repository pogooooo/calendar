import styled from 'styled-components';
import { PageWrapper } from './MapleCalendarPage.styles';

export const Frame=styled(PageWrapper)`
    padding:4px 12px 16px;
    [data-calendar-region='day'] {
        background-color:transparent;
        padding:18px 20px 12px 30px;border-radius:0;
        background-image:linear-gradient(90deg,transparent 17px,${({theme})=>theme.colors.primary}22 17px,${({theme})=>theme.colors.primary}22 18px,transparent 18px);
        border:0; box-shadow:none;
    }
    [data-calendar-region='month'] {
        padding:18px 20px 12px;
        border-left:1px solid ${({theme})=>theme.colors.border}88;
        background:linear-gradient(90deg,${({theme})=>theme.colors.text}05,transparent 18px);
    }
    @media(max-width:1250px){[data-calendar-region='day']{padding:18px 20px 18px 30px;}[data-calendar-region='month']{padding:10px 0;border:0;}}
`;
