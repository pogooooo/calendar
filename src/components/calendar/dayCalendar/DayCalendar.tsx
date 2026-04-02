"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialDayCalendar from "./celestial/CelestialDayCalendar";
import { CategoryType, TodoType } from "@/types/calendar";

export interface DayProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

const DayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild = false, selectedDate = new Date(), todos = [], categories = [], ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        switch (themeName) {
            case 'celestial':
                return <CelestialDayCalendar ref={ref} asChild={asChild} selectedDate={selectedDate} todos={todos} categories={categories} {...props} />;
            default:
                return <CelestialDayCalendar ref={ref} asChild={asChild} selectedDate={selectedDate} todos={todos} categories={categories} {...props} />;
        }
    }
);

DayCalendar.displayName = "DayCalendar";

export default DayCalendar;