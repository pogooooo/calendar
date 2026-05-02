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
import useProjectStore from "@/store/useProjectStore";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
}

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
    todoContextMenu: { x: number, y: number, todo: CalendarTodoType } | null;
    moreModalDate: Date | null;
    weekDates: Date[];
    expandedTodos: CalendarTodoType[];
    todayStr: string;
    dateRangeText: string;
    todoLevels: Record<string, number>;
    maxLevel: number;

    handlePrevWeek: () => void;
    handleNextWeek: () => void;
    toggleCategory: (categoryId: string) => void;
    handleContextMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleQuickEdit: (todo: CalendarTodoType) => void;
    handleQuickDelete: (todo: CalendarTodoType) => void;
    handleQuickToggle: (todo: CalendarTodoType) => void;
    handleCreateTodo: (date: Date) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setMoreModalDate: (date: Date | null) => void;
    setTodoContextMenu: (menu: { x: number, y: number, todo: CalendarTodoType } | null) => void;

    categories: CategoryType[];
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;

    showProjects: boolean;
    onToggleProjects: () => void;
}

const WeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
        const [showProjects, setShowProjects] = React.useState(true);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [todoContextMenu, setTodoContextMenu] = React.useState<{ x: number, y: number, todo: CalendarTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { projects, fetchProjects } = useProjectStore();
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

        React.useEffect(() => {
            fetchProjects(authFetch);
        }, [fetchProjects, authFetch]);

        const filteredTodos = React.useMemo(() => {
            const baseTodos = todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));

            if (!showProjects) return baseTodos;

            const projectItems = projects.reduce<TodoType[]>((acc, proj) => {
                if (selectedCategoryIds.includes(proj.categoryId)) {
                    const isProjCompleted = proj.status === 'done';

                    acc.push({
                        id: `project-${proj.id}`,
                        title: `[Project] ${proj.title}`,
                        categoryId: proj.categoryId,
                        startAt: proj.startAt ? new Date(proj.startAt).toISOString() : null,
                        endAt: proj.endAt ? new Date(proj.endAt).toISOString() : null,
                        isAllDay: true,
                        repeat: 0,
                        memo: proj.description || null,
                        check: isProjCompleted ? 'done' : 'none',
                        completions: [],
                        originalData: proj as any,
                        isProject: true,
                        isDone: isProjCompleted
                    } as unknown as TodoType);

                    if (proj.tasks && Array.isArray(proj.tasks)) {
                        proj.tasks.forEach(task => {
                            if (task.startAt || task.endAt) {
                                const isTaskCompleted = task.status === 'done';
                                acc.push({
                                    id: `proj-task-${task.id}`,
                                    title: `↳ ${task.title}`,
                                    categoryId: proj.categoryId,
                                    startAt: task.startAt ? new Date(task.startAt).toISOString() : null,
                                    endAt: task.endAt ? new Date(task.endAt).toISOString() : null,
                                    isAllDay: true,
                                    repeat: 0,
                                    memo: task.description || null,
                                    check: isTaskCompleted ? 'done' : 'none',
                                    completions: [],
                                    originalData: task as any,
                                    isProjectTask: true,
                                    isDone: isTaskCompleted
                                } as unknown as TodoType);
                            }
                        });
                    }
                }
                return acc;
            }, []);

            return [...baseTodos, ...projectItems];
        }, [todos, projects, selectedCategoryIds, showProjects]);

        const expandedTodos = useExpandedTodos(
            filteredTodos,
            weekDates[0],
            weekDates[6]
        ) as CalendarTodoType[];

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

        const handleContextMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            setTodoContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleQuickEdit = (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                alert("프로젝트 관련 항목은 프로젝트 메뉴에서 수정해주세요.");
                setTodoContextMenu(null);
                return;
            }
            setModalTodo(expandedTodo.originalTodo || expandedTodo as unknown as TodoType);
            setIsModalOpen(true);
            setTodoContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                alert("프로젝트 관련 항목은 프로젝트 상세 메뉴에서 삭제해주세요.");
                setTodoContextMenu(null);
                return;
            }
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            if (window.confirm("정말 삭제하시겠습니까? (반복 일정 전체가 삭제됩니다)")) {
                await deleteTodo(authFetch, actualId);
            }
            setTodoContextMenu(null);
        };

        const handleQuickToggle = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                alert("프로젝트 상태는 프로젝트 상세 메뉴에서 변경해주세요.");
                setTodoContextMenu(null);
                return;
            }
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
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev)
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