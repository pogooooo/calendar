"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialMonthCalendar from "./celestial/CelestialMonthCalendar";
import { CategoryType, TodoType } from "@/types/calendar";

export interface MonthProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

const MonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild = false, todos = [], categories = [], ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        switch (themeName) {
            case 'celestial':
                return <CelestialMonthCalendar ref={ref} asChild={asChild} todos={todos} categories={categories} {...props} />;
            default:
                return <CelestialMonthCalendar ref={ref} asChild={asChild} todos={todos} categories={categories} {...props} />;
        }
    }
);

MonthCalendar.displayName = "MonthCalendar";

export default MonthCalendar;