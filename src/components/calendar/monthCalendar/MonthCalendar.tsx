"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import CelestialMonthCalendar from "./celestial/CelestialMonthCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useTodoStore from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import { localDateKey } from "@/lib/dateKey";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
    isChallenge?: boolean;
    originalChallenge?: ChallengeType;
    isDone?: boolean;
}

export interface MonthProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    todos?: TodoType[];
    categories?: CategoryType[];
    /**
     * 켜면 보여 주는 달이 고른 날짜를 따라간다.
     * 폰처럼 월간·일간을 갈아 끼우는 화면에서, 일간에서 10월로 넘어간 뒤
     * 월간으로 돌아왔는데 9월이 떠 있는 일을 막는다.
     */
    followSelectedDate?: boolean;
}

export interface MonthThemeProps {
    asChild?: boolean;
    currentDate: Date;
    direction: number;
    selectedCategoryIds: string[];
    isModalOpen: boolean;
    modalTodo: TodoType | null;
    selectedDateForModal: Date | undefined;
    contextMenu: { x: number, y: number, todo: CalendarTodoType } | null;
    moreModalDate: Date | null;
    weeks: Date[][];
    expandedTodos: CalendarTodoType[];
    challengeTodos: CalendarTodoType[];
    todayStr: string;
    dateRangeText: string;

    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleToday: () => void;
    isOnToday: boolean;
    toggleCategory: (categoryId: string) => void;
    handleContextMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleQuickEdit: (todo: CalendarTodoType) => void;
    handleQuickDelete: (todo: CalendarTodoType) => void;
    handleQuickDeleteOne: (todo: CalendarTodoType) => void;
    handleQuickToggle: (todo: CalendarTodoType) => void;
    handleCreateTodo: (date: Date) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setMoreModalDate: (date: Date | null) => void;
    setContextMenu: (menu: { x: number, y: number, todo: CalendarTodoType } | null) => void;

    handleContextMenuChallenge: (e: React.MouseEvent, challenge: CalendarTodoType) => void;
    handleQuickToggleChallenge: (challenge: CalendarTodoType) => void;

    categories: CategoryType[];
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;

    showProjects: boolean;
    onToggleProjects: () => void;
    showChallenges: boolean;
    onToggleChallenges: () => void;
}

const MonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, followSelectedDate = false, ...props }, ref) => {
        const MonthCalendarView = usePickTheme({ celestial: CelestialMonthCalendar });

        const [currentDate, setCurrentDate] = React.useState(
            () => (followSelectedDate && selectedDate ? new Date(selectedDate) : new Date()));
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const [showProjects, setShowProjects] = React.useState(true);
        const [showChallenges, setShowChallenges] = React.useState(true);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, todo: CalendarTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
        const { deleteTodo, deleteTodoOccurrence, toggleTodo } = useTodoStore();
        // 자체 fetch 를 쓰면 토큰 갱신을 건너뛰어 1시간 뒤 모든 조작이 조용히 실패한다
        const authFetch = useAuthFetch();
        const dialog = useDialog();
        const t = useT();

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        // 카테고리가 처음 도착했을 때 한 번만 전부 고른다. 고른 개수를 의존성에 넣으면
        // 사용자가 다 해제한 순간 도로 전부 골라 버린다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [categories]);

        React.useEffect(() => {
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
        }, [fetchProjects, fetchChallenges, authFetch]);

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

        const flatDates = React.useMemo(() => weeks.flat(), [weeks]);

        const filteredTodos = React.useMemo(() => {
            const baseTodos = todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));
            let projectItems: TodoType[] = [];

            if (showProjects) {
                projectItems = projects.reduce<TodoType[]>((acc, proj) => {
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
                            completions: [],
                            originalData: proj as unknown as TodoType,
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
                                        completions: [],
                                        originalData: task as unknown as TodoType,
                                        isProjectTask: true,
                                        isDone: isTaskCompleted
                                    } as unknown as TodoType);
                                }
                            });
                        }
                    }
                    return acc;
                }, []);
            }

            return [...baseTodos, ...projectItems];
        }, [todos, projects, selectedCategoryIds, showProjects]);

        const challengeTodos = React.useMemo(() => {
            if (!showChallenges) return [];
            const items: CalendarTodoType[] = [];

            challenges.forEach(challenge => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return;

                const start = new Date(challenge.startAt);
                start.setHours(0, 0, 0, 0);

                const safeTargetCount = challenge.targetCount ?? null;

                flatDates.forEach(date => {
                    const current = new Date(date);
                    current.setHours(0, 0, 0, 0);

                    const diffTime = current.getTime() - start.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 0 && diffDays % challenge.interval === 0) {
                        const pastDatesCount = Math.floor(diffDays / challenge.interval) + 1;

                        if (safeTargetCount !== null && pastDatesCount > safeTargetCount) {
                            return;
                        }

                        const currentStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

                        const isCompleted = (challenge.completions || []).some(comp => {
                            const cDate = new Date(comp.targetDate);
                            const compStr = `${cDate.getFullYear()}-${String(cDate.getMonth() + 1).padStart(2, '0')}-${String(cDate.getDate()).padStart(2, '0')}`;
                            return compStr === currentStr;
                        });

                        items.push({
                            id: `challenge-${challenge.id}-${current.getTime()}`,
                            title: challenge.title,
                            categoryId: challenge.categoryId,
                            startAt: current.toISOString(),
                            endAt: current.toISOString(),
                            isAllDay: true,
                            repeat: 0,
                            memo: challenge.description || null,
                            completions: [],
                            isChallenge: true,
                            isDone: isCompleted,
                            originalChallenge: challenge
                        } as unknown as CalendarTodoType);
                    }
                });
            });

            return items;
        }, [challenges, selectedCategoryIds, showChallenges, flatDates]);

        const expandedTodos = useExpandedTodos(
            filteredTodos,
            weeks.length > 0 ? weeks[0][0] : undefined,
            weeks.length > 0 ? weeks[5][6] : undefined
        ) as CalendarTodoType[];

        const todayStr = React.useMemo(() => new Date().toDateString(), []);
        const dateRangeText = React.useMemo(() => {
            return t.calendar.monthTitle(currentDate.getFullYear(), currentDate.getMonth() + 1);
        }, [currentDate, t.calendar]);

        const handlePrevMonth = () => {
            setDirection(-1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        };

        const handleNextMonth = () => {
            setDirection(1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        };

        const handleToday = () => {
            const today = new Date();
            setDirection(
                today.getFullYear() * 12 + today.getMonth()
                    < currentDate.getFullYear() * 12 + currentDate.getMonth() ? -1 : 1);
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            onDateChange?.(today);
        };

        const isOnToday = React.useMemo(() => {
            const today = new Date();
            return currentDate.getFullYear() === today.getFullYear()
                && currentDate.getMonth() === today.getMonth();
        }, [currentDate]);

        // 고른 날짜가 다른 달로 넘어가면 보여 주는 달도 따라간다.
        React.useEffect(() => {
            if (!followSelectedDate || !selectedDate) return;
            setCurrentDate(prev =>
                (prev.getFullYear() === selectedDate.getFullYear() && prev.getMonth() === selectedDate.getMonth())
                    ? prev
                    : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        }, [followSelectedDate, selectedDate]);

        const toggleCategory = (categoryId: string) => {
            setSelectedCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const handleContextMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleContextMenuChallenge = async (e: React.MouseEvent, challenge: CalendarTodoType) => {
            e.preventDefault();
            await dialog.notify({
                title: challenge.title,
                message: t.alert.challengeToggled(challenge.isDone ? t.alert.stateDone : t.alert.stateUndone),
            });
        };

        const handleQuickEdit = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setContextMenu(null);
                await dialog.notify({ title: t.alert.editHereTitle, message: t.alert.editHereMsg });
                return;
            }
            setModalTodo(expandedTodo.originalTodo || (expandedTodo as unknown as TodoType));
            setIsModalOpen(true);
            setContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            setContextMenu(null);
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                await dialog.notify({ title: t.alert.deleteHereTitle, message: t.alert.deleteHereDetailMsg });
                return;
            }

            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            const ok = await dialog.confirmDanger({
                title: t.alert.deleteTodoTitle,
                message: (expandedTodo.originalTodo?.repeat ?? expandedTodo.repeat ?? 0) > 0 ? t.alert.deleteTodoMsg : t.alert.deleteTodoOnceMsg,
            });
            if (!ok) return;
            const error = await deleteTodo(authFetch, actualId);
            if (error) await dialog.notify({ title: t.alert.deleteFailed, message: error });
        };

        const handleQuickDeleteOne = async (expandedTodo: CalendarTodoType) => {
            setContextMenu(null);
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                await dialog.notify({ title: t.alert.deleteHereTitle, message: t.alert.deleteHereDetailMsg });
                return;
            }
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            const occurrence = expandedTodo.date ?? new Date(expandedTodo.startAt || Date.now());
            const ok = await dialog.confirm({
                title: t.alert.deleteOneDayTitle,
                message: t.alert.deleteOneDayMsg,
                confirmLabel: t.dialog.delete,
            });
            if (!ok) return;
            await deleteTodoOccurrence(authFetch, actualId, localDateKey(occurrence));
        };

        const handleQuickToggle = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setContextMenu(null);
                await dialog.notify({ title: t.alert.statusHereTitle, message: t.alert.statusHereMsg });
                return;
            }

            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;

            const targetDateStr = expandedTodo.date
                ? expandedTodo.date.toISOString()
                : new Date(expandedTodo.startAt || new Date()).toISOString();

            await toggleTodo(authFetch, actualId, targetDateStr);
            setContextMenu(null);
        };

        const handleQuickToggleChallenge = async (challengeTodo: CalendarTodoType) => {
            const challengeId = challengeTodo.originalChallenge?.id;
            if (!challengeId) return;

            const cellDate = new Date(challengeTodo.startAt as string);
            const offset = cellDate.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(cellDate.getTime() - offset)).toISOString().split('T')[0] + 'T00:00:00.000Z';

            await toggleChallengeCompletion(authFetch, challengeId, localISOTime);
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
            challengeTodos,
            todayStr,
            dateRangeText,
            categories,
            selectedDate,
            onDateChange,
            handlePrevMonth,
            handleNextMonth,
            handleToday,
            isOnToday,
            toggleCategory,
            handleContextMenu,
            handleQuickEdit,
            handleQuickDelete,
            handleQuickDeleteOne,
            handleQuickToggle,
            handleCreateTodo,
            setIsModalOpen,
            setMoreModalDate,
            setContextMenu,
            handleContextMenuChallenge,
            handleQuickToggleChallenge,
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev),
            showChallenges,
            onToggleChallenges: () => setShowChallenges(prev => !prev)
        };

        return (
            <>
                <MonthCalendarView ref={ref} {...themeProps} {...props} />
            </>
        );
    }
);

MonthCalendar.displayName = "MonthCalendar";

export default MonthCalendar;