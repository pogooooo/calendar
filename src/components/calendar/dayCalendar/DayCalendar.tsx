"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialDayCalendar from "./celestial/CelestialDayCalendar";
import { CategoryType } from "@/types/calendar";
import { TodoType } from "@/store/useTodoStore";

import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useExpandedTodos } from "@/hooks/useExpandedTodos";

export interface DayProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

export interface DayThemeProps {
    asChild?: boolean;
    formattedDate: string;
    hours: number[];
    getSlotColor: (hour: number, slotIdx: number) => string | null;
    tasks: { id: string; text: string; isDone: boolean }[];
    newTaskText: string;
    setNewTaskText: (text: string) => void;
    handleAddTask: (e: React.FormEvent) => void;
    toggleDailyTask: (id: string) => void;
    deleteDailyTask: (id: string) => void;
    localMemo: string;
    setLocalMemo: (text: string) => void;
    handleMemoBlur: () => void;
}

const DayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild = false, selectedDate = new Date(), todos = [], categories = [], onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const { tasks, memo, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask, updateDailyMemo } = useDailyStore();
        const authFetch = useAuthFetch();

        const [newTaskText, setNewTaskText] = React.useState("");
        const [localMemo, setLocalMemo] = React.useState("");

        const expandedTodos = useExpandedTodos(todos, selectedDate, selectedDate);

        React.useEffect(() => {
            fetchDailyData(authFetch, selectedDate);
        }, [selectedDate]);

        React.useEffect(() => {
            setLocalMemo(memo || "");
        }, [memo]);

        const handleAddTask = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTaskText.trim()) return;
            const text = newTaskText.trim();
            setNewTaskText("");
            await addDailyTask(authFetch, selectedDate, text);
        };

        const handleMemoBlur = async () => {
            if (localMemo !== memo) {
                await updateDailyMemo(authFetch, selectedDate, localMemo);
            }
        };

        const getSlotColor = React.useCallback((hour: number, slotIdx: number) => {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, slotIdx * 10, 0, 0);

            const slotEnd = new Date(selectedDate);
            slotEnd.setHours(hour, slotIdx * 10 + 9, 59, 999);

            const overlappingTodo = expandedTodos.find(todo => {
                if (todo.isAllDay || !todo.startAt || !todo.endAt) return false;
                const start = new Date(todo.startAt as string | number | Date);
                const end = new Date(todo.endAt as string | number | Date);
                return start <= slotEnd && end >= slotStart;
            });

            if (overlappingTodo) {
                const cat = categories.find(c => c.id === overlappingTodo.categoryId);
                return cat?.color || "var(--primary-color)";
            }
            return null;
        }, [expandedTodos, categories, selectedDate]);

        const hours = Array.from({ length: 24 }, (_, i) => i);
        const formattedDate = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

        const handleToggleTask = (id: string) => toggleDailyTask(authFetch, id);
        const handleDeleteTask = (id: string) => deleteDailyTask(authFetch, id);

        const themeProps: DayThemeProps = {
            asChild,
            formattedDate,
            hours,
            getSlotColor,
            tasks,
            newTaskText,
            setNewTaskText,
            handleAddTask,
            toggleDailyTask: handleToggleTask,
            deleteDailyTask: handleDeleteTask,
            localMemo,
            setLocalMemo,
            handleMemoBlur,
        };

        return (
            <>
                {themeName === 'celestial' ? (
                    <CelestialDayCalendar ref={ref} {...themeProps} {...props} />
                ) : (
                    <CelestialDayCalendar ref={ref} {...themeProps} {...props} />
                )}
            </>
        );
    }
);

DayCalendar.displayName = "DayCalendar";

export default DayCalendar;