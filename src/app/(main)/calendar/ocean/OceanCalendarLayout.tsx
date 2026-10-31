import type { CalendarLayoutProps } from '../CalendarLayout.types';
import * as S from './OceanCalendarPage.styles';
import { Frame } from './OceanWorkspace.styles';
export default function OceanCalendarLayout(p:CalendarLayoutProps) {
    return <Frame data-theme-layout="ocean-calendar"><S.CalendarContainer ref={p.containerRef} $collapsed={p.collapsed} data-resize-direction="1">{p.month}{p.resizer}{p.day}</S.CalendarContainer></Frame>;
}
