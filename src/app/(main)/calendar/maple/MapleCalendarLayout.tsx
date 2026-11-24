import type { CalendarLayoutProps } from "../CalendarLayout.types";
import CalendarSplit from "../CalendarSplit";
import { Frame } from "./MapleWorkspace.styles";

export default function MapleCalendarLayout(props: CalendarLayoutProps) {
    return <Frame data-theme-layout="maple-calendar"><CalendarSplit {...props} dayFirst /></Frame>;
}
