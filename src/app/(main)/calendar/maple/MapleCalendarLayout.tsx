import type { CalendarLayoutProps } from '../CalendarLayout.types';
import * as S from './MapleCalendarPage.styles';
export default function MapleCalendarLayout(p: CalendarLayoutProps) {
    return <S.PageWrapper data-theme-layout="maple-calendar"><S.CalendarContainer ref={p.containerRef} $collapsed={p.collapsed} data-resize-direction="-1">{p.day}{p.resizer}{p.month}</S.CalendarContainer></S.PageWrapper>;
}
