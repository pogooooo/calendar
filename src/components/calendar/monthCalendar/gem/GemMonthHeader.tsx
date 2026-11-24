import type { MonthHeaderProps } from "../MonthHeader.types";
import { DateRangeDisplay, HeaderFrame } from "./GemMonthCalendar.styles";

export default function GemMonthHeader({ navigation, filters }: MonthHeaderProps) {
    return <HeaderFrame data-calendar-header data-theme-layout="gem-month-header">
        <DateRangeDisplay data-calendar-navigation>{navigation}</DateRangeDisplay>
        {filters}
    </HeaderFrame>;
}
