import type { CalendarLayoutProps } from '../CalendarLayout.types';
import * as S from './CelestialCalendarPage.styles';
import { Frame } from './CelestialWorkspace.styles';
export default function CelestialCalendarLayout(p: CalendarLayoutProps) {
    return <Frame data-theme-layout="celestial-calendar"><S.CalendarContainer ref={p.containerRef} $collapsed={p.collapsed} data-resize-direction="1">{p.month}{p.resizer}{p.day}</S.CalendarContainer></Frame>;
}
