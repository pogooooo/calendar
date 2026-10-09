"use client";

import * as React from "react";
import MonthCalendarView from "./MonthCalendarView";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useTodoStore from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { localDateKey, activeTimeZone, parseExcludedDates } from "@/lib/dateKey";
import { toggleOccurrence } from "@/lib/todoDone";
import { addDaysToKey } from "@/lib/timezone";
import { calendarDayDelta, shiftZonedDays, resizeZonedRange } from "@/lib/taskInteractions";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import useProjectStore from "@/store/useProjectStore";
import { projectCalendarItems } from "@/lib/projectCalendar";
import { useProjectItemActions } from "@/hooks/useProjectItemActions";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import { fx, rectOf } from "@/lib/fx";
import { completionKey, completionTargetFor, slotIndexOn } from "@/lib/challengeDays";
import { todayKey as labelKey } from "@/lib/localTime";

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
    handleMoveTodo: (todo: CalendarTodoType, from: string, to: string) => Promise<void>;
    handleResizeTodo: (todo: CalendarTodoType, edge: 'start' | 'end', from: string, to: string) => Promise<void>;
    moveNotice: string | null;
    undoMove: (() => Promise<void>) | null;
    dismissMove: () => void;
}

const MonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild = false, todos = [], categories = [], selectedDate, onDateChange, followSelectedDate = false, ...props }, ref) => {
        const [currentDate, setCurrentDate] = React.useState(
            () => (followSelectedDate && selectedDate ? new Date(selectedDate) : new Date()));
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

        const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, todo: CalendarTodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);

        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
        const { deleteTodo, deleteTodoOccurrence, toggleTodo, updateTodo } = useTodoStore();
        const [moveNotice, setMoveNotice] = React.useState<string | null>(null);
        const [undoMove, setUndoMove] = React.useState<(() => Promise<void>) | null>(null);
        const moving = React.useRef(false);
        // 자체 fetch 를 쓰면 토큰 갱신을 건너뛰어 1시간 뒤 모든 조작이 조용히 실패한다
        const authFetch = useAuthFetch();
        const dialog = useDialog();
        const t = useT();
        // 프로젝트·프로젝트 할 일도 여기서 바로 고치고 끝내고 옮긴다 (예전엔 "프로젝트 화면에서" 안내만)
        const projectActions = useProjectItemActions();


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
            // 프로젝트·할 일 → 달력 항목은 한 곳에서 (src/lib/projectCalendar.ts)
            const projectItems: TodoType[] = showProjects
                ? projectCalendarItems(projects, { categoryIds: selectedCategoryIds, marked: true })
                : [];

            return [...baseTodos, ...projectItems];
        }, [todos, projects, selectedCategoryIds, showProjects]);

        const challengeTodos = React.useMemo(() => {
            if (!showChallenges) return [];
            const items: CalendarTodoType[] = [];

            challenges.forEach(challenge => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return;

                flatDates.forEach(date => {
                    const current = new Date(date);
                    current.setHours(0, 0, 0, 0);

                    // 칸·완료는 날짜 키로 센다 (src/lib/challengeDays.ts, 챌린지 화면·홈과 같은 셈).
                    // 예전엔 기기 0시끼리 빼서 서머타임이 시작된 뒤로 칸이 하루씩 밀렸고, 완료(그날 UTC 0시)를
                    // 기기 시각으로 읽어 서쪽(UTC-) 시간대에선 하루 앞 날에 찍혔다
                    const currentStr = labelKey(current);
                    if (slotIndexOn(challenge, currentStr) !== null) {
                        const isCompleted = (challenge.completions || []).some(comp => completionKey(comp) === currentStr);

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

        // 오늘 표시는 자정을 넘기면 따라간다 — 예전엔 처음 그린 날에 묶여, 켜 둔 데스크톱 앱·위젯이 다음 날에도 어제를 오늘로 칠했다
        const todayKey = useCurrentDayKey();
        const todayStr = React.useMemo(() => new Date(`${todayKey}T00:00:00`).toDateString(), [todayKey]);
        const dateRangeText = React.useMemo(() => {
            return t.calendar.monthTitle(currentDate.getFullYear(), currentDate.getMonth() + 1);
        }, [currentDate, t.calendar]);

        /** 달을 넘길 때 갈래의 효과가 달력 칸 위로 지나간다 */
        const flipFx = (direction: 1 | -1) => fx.emit("month-flip", { direction, rect: rectOf(document.querySelector("[data-fx-zone='month']")) });
        /** 끌어다 놓은 칸에 갈래의 효과가 내려앉는다 */
        const dropFx = (to: string) => fx.emit("drop", { rect: rectOf(document.querySelector(`[data-calendar-date="${to}"]`)) });

        const handlePrevMonth = () => {
            flipFx(-1);
            setDirection(-1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        };

        const handleNextMonth = () => {
            flipFx(1);
            setDirection(1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        };

        const handleToday = () => {
            const today = new Date();
            const back = today.getFullYear() * 12 + today.getMonth() < currentDate.getFullYear() * 12 + currentDate.getMonth();
            if (today.getFullYear() !== currentDate.getFullYear() || today.getMonth() !== currentDate.getMonth()) flipFx(back ? -1 : 1);
            setDirection(back ? -1 : 1);
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            // 이미 오늘을 골라 둔 채면 다시 알리지 않는다 — 폰은 "고른 날을 또 누름 = 일간으로" 라서,
            // 다른 달을 보다 "오늘" 을 누르면 이번 달로 오는 대신 일간 화면으로 넘어갔다
            if (selectedDate?.toDateString() !== today.toDateString()) onDateChange?.(today);
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
            setHiddenCategoryIds(prev =>
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
                projectActions.open(expandedTodo);
                return;
            }
            setUndoMove(null);
            setMoveNotice(null);
            setModalTodo(expandedTodo.originalTodo || (expandedTodo as unknown as TodoType));
            setIsModalOpen(true);
            setContextMenu(null);
        };

        const handleQuickDelete = async (expandedTodo: CalendarTodoType) => {
            setContextMenu(null);
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
            setContextMenu(null);
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
                setContextMenu(null);
                await projectActions.toggle(expandedTodo);
                return;
            }

            const actualId = expandedTodo.originalTodo?.id || expandedTodo.id;

            // 회차의 첫날에 적는다 — 여러 날 일정은 한 번 끝낸다(홈·위젯과 같은 셈, src/lib/todoDone.ts)
            await toggleOccurrence(expandedTodo, (key) => toggleTodo(authFetch, actualId, key));
            setContextMenu(null);
        };

        const handleQuickToggleChallenge = async (challengeTodo: CalendarTodoType) => {
            const challengeId = challengeTodo.originalChallenge?.id;
            if (!challengeId) return;

            // 칸의 날짜 키를 그날 정오(UTC)로 보낸다 — 서버·스토어가 그 UTC 날로 적는다
            await toggleChallengeCompletion(authFetch, challengeId, completionTargetFor(labelKey(new Date(challengeTodo.startAt as string))));
        };

        const handleCreateTodo = (date: Date) => {
            setModalTodo(null);
            setSelectedDateForModal(date);
            setIsModalOpen(true);
        };

        const handleChangeDates = async (todo: CalendarTodoType, from: string, to: string, edge?: 'start' | 'end') => {
            const days = calendarDayDelta(from, to);
            if (todo.isProject || todo.isProjectTask) {
                // 프로젝트·할 일도 끌어서 옮기고 늘린다. 반복이 없으니 시리즈 확인은 없다
                if (!days || !Number.isFinite(days) || moving.current) return;
                const original = todo.originalTodo ?? todo;
                if (!original.startAt || !original.endAt) return;
                const next = edge
                    ? resizeZonedRange(original.startAt, original.endAt, edge, days, activeTimeZone())
                    : { startAt: shiftZonedDays(original.startAt, days, activeTimeZone()), endAt: shiftZonedDays(original.endAt, days, activeTimeZone()) };
                if (!next) { setMoveNotice(t.interaction.invalidDates); return; }
                moving.current = true;
                dropFx(to);
                try {
                    const { error, before } = await projectActions.reschedule(todo, next.startAt, next.endAt);
                    setMoveNotice(error || t.interaction.moved);
                    setUndoMove(error ? null : () => async () => {
                        if (moving.current) return;
                        moving.current = true;
                        try {
                            const { error } = await projectActions.reschedule(todo, before.startAt, before.endAt);
                            setMoveNotice(error);
                            if (!error) setUndoMove(null);
                        } finally { moving.current = false; }
                    });
                    if (!error && selectedDate && localDateKey(selectedDate) === from) onDateChange?.(new Date(`${to}T12:00:00`));
                } finally { moving.current = false; }
                return;
            }
            if (!days || !Number.isFinite(days) || moving.current || todo.isChallenge) return;
            const original = todo.originalTodo ?? todo;
            if (!original.startAt || !original.endAt) return;
            const resized = edge ? resizeZonedRange(original.startAt, original.endAt, edge, days, activeTimeZone()) : null;
            if (edge && !resized) { setMoveNotice(t.interaction.invalidDates); return; }
            moving.current = true;
            try {
                if ((original.repeat ?? 0) > 0 && !(await dialog.confirm({ title: t.interaction.moveSeries, message: edge ? t.interaction.resizeSeriesMessage : t.interaction.moveSeriesMessage, confirmLabel: t.interaction.moveAll }))) return;
                dropFx(to);
                const originalDates = { startAt: original.startAt, endAt: original.endAt, repeatEndDate: original.repeatEndDate ?? null, excludedDates: original.excludedDates ?? null };
                const data = edge ? resized! : {
                    startAt: shiftZonedDays(original.startAt, days, activeTimeZone()),
                    endAt: shiftZonedDays(original.endAt, days, activeTimeZone()),
                    repeatEndDate: original.repeatEndDate ? shiftZonedDays(original.repeatEndDate, days, activeTimeZone()) : null,
                    excludedDates: original.excludedDates ? JSON.stringify(parseExcludedDates(original.excludedDates).map(key => addDaysToKey(key, days))) : null,
                };
                const error = await updateTodo(authFetch, original.id, data);
                setMoveNotice(error || t.interaction.moved);
                setUndoMove(error ? null : () => async () => {
                    if (moving.current) return;
                    moving.current = true;
                    try {
                        const error = await updateTodo(authFetch, original.id, originalDates);
                        setMoveNotice(error);
                        if (!error) setUndoMove(null);
                    } finally { moving.current = false; }
                });
                if (!error && selectedDate && localDateKey(selectedDate) === from) onDateChange?.(new Date(`${to}T12:00:00`));
            } finally { moving.current = false; }
        };
        const handleMoveTodo = (todo: CalendarTodoType, from: string, to: string) => handleChangeDates(todo, from, to);
        const handleResizeTodo = (todo: CalendarTodoType, edge: 'start' | 'end', from: string, to: string) => handleChangeDates(todo, from, to, edge);

        const themeProps: MonthThemeProps = {
            asChild,
            handleMoveTodo,
            handleResizeTodo,
            moveNotice,
            undoMove,
            dismissMove: () => { setMoveNotice(null); setUndoMove(null); },
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
                {projectActions.editor}
            </>
        );
    }
);

MonthCalendar.displayName = "MonthCalendar";

export default MonthCalendar;
