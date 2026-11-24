import type { CalendarLayoutProps } from "../CalendarLayout.types";
import CalendarSplit from "../CalendarSplit";
import { PageWrapper as Frame } from "./GemCalendarPage.styles";

export default function GemCalendarLayout(props: CalendarLayoutProps) {
    return <Frame data-theme-layout="gem-calendar" data-gem-route-content><CalendarSplit {...props} /></Frame>;
}
