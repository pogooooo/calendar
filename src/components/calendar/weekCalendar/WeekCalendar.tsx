"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialWeekCalendar from "./celestial/CelestialWeekCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import { getWeekDates } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import useTodoStore from "@/store/useTodoStore";
import useAuthStore from "@/store/useAuthStore";
import { formatDate } from "@/utils/DateUtils";

export interface WeekProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
}

export interface WeekThemeProps {
    asChild?: boolean;
    currentDate: Date;
    direction: number;
    selectedCategoryIds: string[];
    isModalOpen: boolean;
    modalTodo: TodoType | null;
    selectedDateForModal: Date | undefined;
    todoContextMenu: { x: number, y: number, todo: ExpandedTodoType } | null;
    moreModalDate: Date | null;
    weekDates: Date[];
    expandedTodos: ExpandedTodoType[];
    todayStr: string;
    dateRangeText: string;
    todoLevels: Record<string, number>;
    maxLevel: number;

    handlePrevWeek: () => void;
    handleNextWeek: () => void;
    toggleCategory: (categoryId: string) => void;
    handleContextMenu: (e: React.MouseEvent, todo: ExpandedTodoType) => void;
    handleQuickEdit: (todo: ExpandedTodoType) => void;
    handleQuickDelete: (todo: ExpandedTodoType) => void;
    handleQuickToggle: (todo: ExpandedTodoType) => void;
    handleCreateTodo: (date: Date) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setMoreModalDate: (date: Date | null) => void;
    setTodoContextMenu: (menu: { x: number, y: number, todo: ExpandedTodoType } | null) => void; // ✨ ExpandedTodoType

    categories: CategoryType[];
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
}

const WeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        // ✨ 컨텍스트 메뉴에 ExpandedTodoType 전체를 저장
        const [todoContextMenu, setTodoContextMenu] = React.useState<{ x: number, y: number, todo: ExpandedTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { deleteTodo, toggleTodo } = useTodoStore();
        const accessToken = useAuthStore((state) => state.accessToken);

        const authFetch = React.useCallback(async (url: string, init?: RequestInit) => {
            return fetch(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` } });
        }, [accessToken]);

        const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
        const todayStr = React.useMemo(() => new Date().toDateString(), []);

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        }, [categories]);

        const filteredTodos = React.useMemo(() => {
            return todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));
        }, [todos, selectedCategoryIds]);

        const expandedTodos = useExpandedTodos(
            filteredTodos,
            weekDates[0],
            weekDates[6]
        );

        const { todoLevels, maxLevel } = useTodoLevels(expandedTodos, weekDates);

        const dateRangeText = React.useMemo(() => {
            return `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`;
        }, [weekDates]);

        const handlePrevWeek = () => {
            setDirection(-1);
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() - 7);
                return newDate;
            });
        };

        const handleNextWeek = () => {
            setDirection(1);
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() + 7);
                return newDate;
            });
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
            setTodoContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleQuickEdit = (expandedTodo: ExpandedTodoType) => {
            setModalTodo(expandedTodo.originalTodo || expandedTodo as unknown as TodoType);
            setIsModalOpen(true);
            setTodoContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: ExpandedTodoType) => {
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            if (window.confirm("정말 삭제하시겠습니까? (반복 일정 전체가 삭제됩니다)")) {
                await deleteTodo(authFetch, actualId);
            }
            setTodoContextMenu(null);
        };

        const handleQuickToggle = async (expandedTodo: ExpandedTodoType) => {
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            const targetDateStr = expandedTodo.date
                ? expandedTodo.date.toISOString()
                : new Date(expandedTodo.startAt || new Date()).toISOString();

            await toggleTodo(authFetch, actualId, targetDateStr);
            setTodoContextMenu(null);
        };

        const handleCreateTodo = (date: Date) => {
            setModalTodo(null);
            setSelectedDateForModal(date);
            setIsModalOpen(true);
        };

        const themeProps: WeekThemeProps = {
            asChild,
            currentDate,
            direction,
            selectedCategoryIds,
            isModalOpen,
            modalTodo,
            selectedDateForModal,
            todoContextMenu,
            moreModalDate,
            weekDates,
            expandedTodos,
            todayStr,
            dateRangeText,
            todoLevels,
            maxLevel,
            handlePrevWeek,
            handleNextWeek,
            toggleCategory,
            handleContextMenu,
            handleQuickEdit,
            handleQuickDelete,
            handleQuickToggle,
            handleCreateTodo,
            setIsModalOpen,
            setMoreModalDate,
            setTodoContextMenu,
            categories,
            selectedDate,
            onDateChange,
        };

        return (
            <>
                {themeName === 'celestial' ? (
                    <CelestialWeekCalendar ref={ref} {...themeProps} {...props} />
                ) : (
                    <CelestialWeekCalendar ref={ref} {...themeProps} {...props} />
                )}
            </>
        );
    }
);

WeekCalendar.displayName = "WeekCalendar";

export default WeekCalendar;