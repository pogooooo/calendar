"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialWeekCalendar from "./celestial/CelestialWeekCalendar";
import { CategoryType, TodoType } from "@/types/calendar";

export interface WeekProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

const WeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild = false, todos = [], categories = [], ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        switch (themeName) {
            case 'celestial':
                return <CelestialWeekCalendar ref={ref} asChild={asChild} todos={todos} categories={categories} {...props} />;
            default:
                return <CelestialWeekCalendar ref={ref} asChild={asChild} todos={todos} categories={categories} {...props} />;
        }
    }
);

WeekCalendar.displayName = "WeekCalendar";

export default WeekCalendar;