import type { CalendarLayoutProps } from "../CalendarLayout.types";
import CalendarSplit from "../CalendarSplit";
import { Frame } from "./OceanWorkspace.styles";

export default function OceanCalendarLayout(props: CalendarLayoutProps) {
    return <Frame data-theme-layout="ocean-calendar"><CalendarSplit {...props} stacked /></Frame>;
}
