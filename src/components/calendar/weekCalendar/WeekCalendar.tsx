"use client";

import * as React from "react";
import WeekCalendarView from "./WeekCalendarView";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import { getWeekDates } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import useTodoStore from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import { localDateKey } from "@/lib/dateKey";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { formatDate } from "@/utils/DateUtils";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
}

export interface ChallengeTodoType {
    id: string;
    title: string;
    categoryId: string;
    startAt: string;
    isChallenge: boolean;
    isDone: boolean;
    originalChallenge: ChallengeType;
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
    challengeTodos: ChallengeTodoType[];
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
    handleQuickDeleteOne: (todo: CalendarTodoType) => void;
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
    showChallenges: boolean;
    onToggleChallenges: () => void;
}

const WeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
        const [showProjects, setShowProjects] = React.useState(true);
        const [showChallenges, setShowChallenges] = React.useState(true);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [todoContextMenu, setTodoContextMenu] = React.useState<{ x: number, y: number, todo: CalendarTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges } = useChallengeStore();
        const { deleteTodo, deleteTodoOccurrence, toggleTodo } = useTodoStore();
        // 자체 fetch 를 쓰면 토큰 갱신을 건너뛰어 1시간 뒤 모든 조작이 조용히 실패한다
        const authFetch = useAuthFetch();
        const dialog = useDialog();
        const t = useT();

        const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
        const todayStr = React.useMemo(() => new Date().toDateString(), []);

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
                            check: isProjCompleted ? 'done' : 'none'
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
                                        check: isTaskCompleted ? 'done' : 'none'
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

            const items: ChallengeTodoType[] = [];

            challenges.forEach(challenge => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return;

                const start = new Date(challenge.startAt);
                start.setHours(0, 0, 0, 0);

                const safeTargetCount = challenge.targetCount ?? null;

                weekDates.forEach(date => {
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
                            isChallenge: true,
                            isDone: isCompleted,
                            originalChallenge: challenge
                        });
                    }
                });
            });

            return items;
        }, [challenges, selectedCategoryIds, showChallenges, weekDates]);

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

        const handleQuickEdit = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setTodoContextMenu(null);
                await dialog.notify({ title: t.alert.editHereTitle, message: t.alert.editHereMsg });
                return;
            }
            setModalTodo(expandedTodo.originalTodo || expandedTodo as unknown as TodoType);
            setIsModalOpen(true);
            setTodoContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            setTodoContextMenu(null);
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
            setTodoContextMenu(null);
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
                setTodoContextMenu(null);
                await dialog.notify({ title: t.alert.statusHereTitle, message: t.alert.statusHereMsg });
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
            challengeTodos,
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
            handleQuickDeleteOne,
            handleQuickToggle,
            handleCreateTodo,
            setIsModalOpen,
            setMoreModalDate,
            setTodoContextMenu,
            categories,
            selectedDate,
            onDateChange,
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev),
            showChallenges,
            onToggleChallenges: () => setShowChallenges(prev => !prev)
        };

        return (
            <>
                <WeekCalendarView ref={ref} {...themeProps} {...props} />
            </>
        );
    }
);

WeekCalendar.displayName = "WeekCalendar";

export default WeekCalendar;