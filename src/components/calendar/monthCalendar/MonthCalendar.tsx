"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialMonthCalendar from "./celestial/CelestialMonthCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useTodoStore from "@/store/useTodoStore";
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
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const [currentDate, setCurrentDate] = React.useState(new Date());
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

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
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

        const handleContextMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleContextMenuChallenge = async (e: React.MouseEvent, challenge: CalendarTodoType) => {
            e.preventDefault();
            await dialog.notify({
                title: challenge.title,
                message: `${challenge.isDone ? "완료" : "미완료"} · 세부 설정은 챌린지 화면에서 바꿀 수 있습니다.`,
            });
        };

        const handleQuickEdit = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setContextMenu(null);
                await dialog.notify({ title: "여기서는 수정할 수 없습니다", message: "프로젝트 항목은 프로젝트 화면에서 수정해주세요." });
                return;
            }
            setModalTodo(expandedTodo.originalTodo || (expandedTodo as unknown as TodoType));
            setIsModalOpen(true);
            setContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            setContextMenu(null);
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                await dialog.notify({ title: "여기서는 삭제할 수 없습니다", message: "프로젝트 항목은 프로젝트 상세 화면에서 삭제해주세요." });
                return;
            }

            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            const ok = await dialog.confirmDanger({
                title: "일정을 삭제할까요",
                message: "반복 일정 전체가 사라집니다. 되돌릴 수 없습니다.",
            });
            if (!ok) return;
            const error = await deleteTodo(authFetch, actualId);
            if (error) await dialog.notify({ title: "삭제하지 못했습니다", message: error });
        };

        const handleQuickDeleteOne = async (expandedTodo: CalendarTodoType) => {
            setContextMenu(null);
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                await dialog.notify({ title: "여기서는 삭제할 수 없습니다", message: "프로젝트 항목은 프로젝트 상세 화면에서 삭제해주세요." });
                return;
            }
            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            const occurrence = expandedTodo.date ?? new Date(expandedTodo.startAt || Date.now());
            const ok = await dialog.confirm({
                title: "이 날짜만 삭제할까요",
                message: "반복 일정 중 이 하루만 사라집니다. 나머지는 그대로입니다.",
                confirmLabel: "삭제",
            });
            if (!ok) return;
            await deleteTodoOccurrence(authFetch, actualId, localDateKey(occurrence));
        };

        const handleQuickToggle = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setContextMenu(null);
                await dialog.notify({ title: "여기서는 바꿀 수 없습니다", message: "프로젝트 상태는 프로젝트 상세 화면에서 변경해주세요." });
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
                <CelestialMonthCalendar ref={ref} {...themeProps} {...props} />
            </>
        );
    }
);

MonthCalendar.displayName = "MonthCalendar";

export default MonthCalendar;