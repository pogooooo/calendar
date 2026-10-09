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
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { localDateKey, labelKey, wallNow, zonedTime } from "@/lib/dateKey";
import { toggleOccurrence } from "@/lib/todoDone";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { formatDate } from "@/utils/DateUtils";
import useProjectStore from "@/store/useProjectStore";
import { projectCalendarItems } from "@/lib/projectCalendar";
import { useProjectItemActions } from "@/hooks/useProjectItemActions";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import { completionKey, slotIndexOn } from "@/lib/challengeDays";

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
        // 칸 Date — 고른 시간대의 지금 (예전엔 이 기기의 지금이라 시간대가 다르면 다른 주·다른 오늘이 섰다)
        const [currentDate, setCurrentDate] = React.useState(wallNow);
        const [direction, setDirection] = React.useState(0);
        /**
         * 끈 카테고리를 기억한다 (켠 것이 아니라). 예전엔 카테고리가 처음 왔을 때 전부 켜 둔 목록을 들고 있어서,
         * 그 뒤에 생긴 카테고리(본 창에서 만든 것, 새로 공유받은 것)는 켜지지 않았다 — 늘 떠 있는 월간·주간 위젯에서
         * 새 카테고리의 일정이 다시 열 때까지 보이지 않았고, 다 끈 뒤 목록을 다시 받으면 도로 다 켜졌다
         */
        const [hiddenCategoryIds, setHiddenCategoryIds] = React.useState<string[]>([]);
        const selectedCategoryIds = React.useMemo(
            () => categories.filter(c => !hiddenCategoryIds.includes(c.id)).map(c => c.id),
            [categories, hiddenCategoryIds]
        );
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
        // 오늘 표시는 자정을 넘기면 따라간다 — 예전엔 처음 그린 날에 묶여, 켜 둔 데스크톱 앱·위젯이 다음 날에도 어제를 오늘로 칠했다
        const todayKey = useCurrentDayKey();
        const todayStr = React.useMemo(() => new Date(`${todayKey}T00:00:00`).toDateString(), [todayKey]);


        React.useEffect(() => {
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
        }, [fetchProjects, fetchChallenges, authFetch]);

        const filteredTodos = React.useMemo(() => {
            const baseTodos = todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));
            // 프로젝트·할 일 → 달력 항목은 한 곳에서 (src/lib/projectCalendar.ts)
            const projectItems: TodoType[] = showProjects
                ? projectCalendarItems(projects, { categoryIds: selectedCategoryIds, marked: true })
                : [];

            return [...baseTodos, ...projectItems];
        }, [todos, projects, selectedCategoryIds, showProjects]);

        const challengeTodos = React.useMemo(() => {
            if (!showChallenges) return [];

            const items: ChallengeTodoType[] = [];

            challenges.forEach(challenge => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return;

                weekDates.forEach(date => {
                    const current = new Date(date);
                    current.setHours(0, 0, 0, 0);

                    // 칸·완료는 날짜 키로 센다 (src/lib/challengeDays.ts) — 월간 달력과 같은 까닭
                    const currentStr = labelKey(current);
                    if (slotIndexOn(challenge, currentStr) !== null) {
                        const isCompleted = (challenge.completions || []).some(comp => completionKey(comp) === currentStr);

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

        // 창은 실제 순간으로 — 첫 칸·끝 칸의 날(고른 시간대)의 0시 (칸 Date 는 이 기기 시각이다)
        const [windowStart, windowEnd] = React.useMemo(
            () => [zonedTime(labelKey(weekDates[0])), zonedTime(labelKey(weekDates[6]))],
            [weekDates]
        );
        const expandedTodos = useExpandedTodos(filteredTodos, windowStart, windowEnd) as CalendarTodoType[];

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
            setHiddenCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        // 프로젝트·프로젝트 할 일도 여기서 바로 고치고 끝낸다 (예전엔 "프로젝트 화면에서" 안내만)
        const projectActions = useProjectItemActions();

        const handleContextMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            setTodoContextMenu({ x: e.clientX, y: e.clientY, todo: todo });
        };

        const handleQuickEdit = async (expandedTodo: CalendarTodoType) => {
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                setTodoContextMenu(null);
                projectActions.open(expandedTodo);
                return;
            }
            setModalTodo(expandedTodo.originalTodo || expandedTodo as unknown as TodoType);
            setIsModalOpen(true);
            setTodoContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            setTodoContextMenu(null);
            if (expandedTodo.isProject || expandedTodo.isProjectTask) {
                await projectActions.remove(expandedTodo);
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
                await projectActions.remove(expandedTodo);
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
                await projectActions.toggle(expandedTodo);
                return;
            }

            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;
            // 회차의 첫날에 적는다 — 여러 날 일정은 한 번 끝낸다(홈·위젯과 같은 셈, src/lib/todoDone.ts)
            await toggleOccurrence(expandedTodo, (key) => toggleTodo(authFetch, actualId, key));
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
                {projectActions.editor}
            </>
        );
    }
);

WeekCalendar.displayName = "WeekCalendar";

export default WeekCalendar;