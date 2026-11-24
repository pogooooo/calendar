import type { CalendarLayoutProps } from "../CalendarLayout.types";
import CalendarSplit from "../CalendarSplit";
import { Frame } from "./CelestialWorkspace.styles";

export default function CelestialCalendarLayout(props: CalendarLayoutProps) {
    return <Frame data-theme-layout="celestial-calendar"><CalendarSplit {...props} /></Frame>;
}
