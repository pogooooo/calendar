"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialMonthCalendar from "./celestial/CelestialMonthCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useTodoStore from "@/store/useTodoStore";
import useAuthStore from "@/store/useAuthStore";

export interface MonthProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

export interface MonthThemeProps {
    asChild?: boolean;
    currentDate: Date;
    direction: number;
    selectedCategoryIds: string[];
    isModalOpen: boolean;
    modalTodo: TodoType | null;
    selectedDateForModal: Date | undefined;
    contextMenu: { x: number, y: number, todo: ExpandedTodoType } | null;
    moreModalDate: Date | null;
    weeks: Date[][];
    expandedTodos: ExpandedTodoType[];
    todayStr: string;
    dateRangeText: string;

    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    toggleCategory: (categoryId: string) => void;
    handleContextMenu: (e: React.MouseEvent, todo: ExpandedTodoType) => void;
    handleQuickEdit: (todo: ExpandedTodoType) => void;
    handleQuickDelete: (todo: ExpandedTodoType) => void;
    handleQuickToggle: (todo: ExpandedTodoType) => void;
    handleCreateTodo: (date: Date) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setMoreModalDate: (date: Date | null) => void;
    setContextMenu: (menu: { x: number, y: number, todo: ExpandedTodoType } | null) => void;

    categories: CategoryType[];
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
}

const MonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, todo: ExpandedTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { deleteTodo, toggleTodo } = useTodoStore();
        const accessToken = useAuthStore((state) => state.accessToken);

        const authFetch = React.useCallback(async (url: string, init?: RequestInit) => {
            return fetch(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` } });
        }, [accessToken]);

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        }, [categories]);

        const filteredTodos = React.useMemo(() => {
            return todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));
        }, [todos, selectedCategoryIds]);

        const weeks = React.useMemo(() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const startDay = firstDay.getDay();
            const startDate = new Date(year, month, 1 - startDay);

            const allDates = [];
            for (let i = 0; i < 42; i++) {
                allDates.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
            }

            const chunked = [];
            for (let i = 0; i < 42; i += 7) {
                chunked.push(allDates.slice(i, i + 7));
            }
            return chunked;
        }, [currentDate]);

        const expandedTodos = useExpandedTodos(
            filteredTodos,
            weeks.length > 0 ? weeks[0][0] : undefined,
            weeks.length > 0 ? weeks[5][6] : undefined
        );

        const todayStr = React.useMemo(() => new Date().toDateString(), []);
        const dateRangeText = React.useMemo(() => {
            return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
        }, [currentDate]);

        const handlePrevMonth = () => {
            setDirection(-1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        };

        const handleNextMonth = () => {
            setDirection(1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        };

        const toggleCategory = (categoryId: string) => {
            setSelectedCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const handleContextMenu = (e: React.MouseEvent, todo: ExpandedTodoType) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleQuickEdit = (expandedTodo: ExpandedTodoType) => {
            setModalTodo(expandedTodo.originalTodo || expandedTodo as unknown as TodoType);
            setIsModalOpen(true);
            setContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: ExpandedTodoType) => {
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            if (window.confirm("정말 삭제하시겠습니까? (반복 일정 전체가 삭제됩니다)")) {
                await deleteTodo(authFetch, actualId);
            }
            setContextMenu(null);
        };

        const handleQuickToggle = async (expandedTodo: ExpandedTodoType) => {
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;

            const targetDateStr = expandedTodo.date
                ? expandedTodo.date.toISOString()
                : new Date(expandedTodo.startAt || new Date()).toISOString();

            await toggleTodo(authFetch, actualId, targetDateStr);
            setContextMenu(null);
        };

        const handleCreateTodo = (date: Date) => {
            setModalTodo(null);
            setSelectedDateForModal(date);
            setIsModalOpen(true);
        };

        const themeProps: MonthThemeProps = {
            asChild,
            currentDate,
            direction,
            selectedCategoryIds,
            isModalOpen,
            modalTodo,
            selectedDateForModal,
            contextMenu,
            moreModalDate,
            weeks,
            expandedTodos,
            todayStr,
            dateRangeText,
            categories,
            selectedDate,
            onDateChange,
            handlePrevMonth,
            handleNextMonth,
            toggleCategory,
            handleContextMenu,
            handleQuickEdit,
            handleQuickDelete,
            handleQuickToggle,
            handleCreateTodo,
            setIsModalOpen,
            setMoreModalDate,
            setContextMenu
        };

        return (
            <>
                {themeName === 'celestial' ? (
                    <CelestialMonthCalendar ref={ref} {...themeProps} {...props} />
                ) : (
                    <CelestialMonthCalendar ref={ref} {...themeProps} {...props} />
                )}
            </>
        );
    }
);

MonthCalendar.displayName = "MonthCalendar";

export default MonthCalendar;