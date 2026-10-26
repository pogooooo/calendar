import type { CalendarLayoutProps } from '../CalendarLayout.types';
import * as S from './GemCalendarPage.styles';

export default function GemCalendarLayout(p: CalendarLayoutProps) {
    return <S.PageWrapper data-theme-layout="gem-calendar">
        <S.CalendarContainer ref={p.containerRef} $collapsed={p.collapsed} data-resize-direction="1">
            {p.month}{p.resizer}{p.day}
        </S.CalendarContainer>
    </S.PageWrapper>;
}
