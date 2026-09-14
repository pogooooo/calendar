"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import CelestialDayCalendar from "./celestial/CelestialDayCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import useTodoStore from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import { useDialog } from "@/components/dialog/DialogProvider";
import { localDateKey } from "@/lib/dateKey";
import { isBetween } from "@/utils/DateUtils";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
    isDone?: boolean;
}

// contextMenu 는 div 의 HTML 속성 이름과 겹친다. 우리 뜻(열린 메뉴 상태)을 쓴다.
export interface DayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'> {
    asChild?: boolean;
    selectedDate?: Date;
    todos?: TodoType[];
    categories?: CategoryType[];
}

export interface DayChallengeItem {
    id: string;
    challengeId: string;
    title: string;
    isDone: boolean;
}

export interface DayThemeProps {
    asChild?: boolean;
    formattedDate: string;
    /** 선택한 날짜에 해당하는 챌린지 (없으면 빈 배열) */
    dayChallenges: DayChallengeItem[];
    toggleChallenge: (item: DayChallengeItem) => void;
    hours: number[];
    getSlotTodos: (hour: number, slotIdx: number) => CalendarTodoType[]; // ✨ 타입 확장
    tasks: { id: string; title: string; isDone: boolean }[];
    newTaskText: string;
    setNewTaskText: (text: string) => void;
    handleAddTask: (e: React.FormEvent) => void;
    toggleDailyTask: (task: { id: string; title: string; isDone: boolean }) => void;
    deleteDailyTask: (task: { id: string; title: string; isDone: boolean }) => void;
    localMemo: string;
    setLocalMemo: (text: string) => void;
    handleMemoBlur: () => void;
    memoError: string | null;

    categories: CategoryType[];
    selectedCategoryIds: string[];
    toggleCategory: (categoryId: string) => void;
    showProjects: boolean;
    onToggleProjects: () => void;

    /** 이 날에 걸린 일정들. 폰에서는 이 목록이 일정을 고치는 유일한 길이다. */
    dayTodos: CalendarTodoType[];
    selectedDate: Date;
    isModalOpen: boolean;
    modalTodo: TodoType | null;
    setIsModalOpen: (open: boolean) => void;
    contextMenu: { x: number; y: number; todo: CalendarTodoType } | null;
    setContextMenu: (menu: { x: number; y: number; todo: CalendarTodoType } | null) => void;
    openTodoMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleQuickEdit: (todo: CalendarTodoType) => void;
    handleQuickDelete: (todo: CalendarTodoType) => void;
    handleQuickDeleteOne: (todo: CalendarTodoType) => void;
    handleQuickToggle: (todo: CalendarTodoType) => void;
}

const DayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild = false, selectedDate = new Date(), todos = [], categories = [], ...props }, ref) => {
        const DayCalendarView = usePickTheme({ celestial: CelestialDayCalendar });

        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
        const [showProjects, setShowProjects] = React.useState(true);

        const { tasks, memo, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask, updateDailyMemo } = useDailyStore();
        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
        const { deleteTodo, deleteTodoOccurrence, toggleTodo } = useTodoStore();
        const authFetch = useAuthFetch();
        const dialog = useDialog();
        const t = useT();

        const [newTaskText, setNewTaskText] = React.useState("");
        const [localMemo, setLocalMemo] = React.useState("");
        const [memoError, setMemoError] = React.useState<string | null>(null);

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        // 카테고리가 처음 도착했을 때 한 번만 전부 고른다. 고른 개수를 의존성에 넣으면
        // 사용자가 다 해제한 순간 도로 전부 골라 버린다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [categories]);

        // 날짜가 바뀔 때는 그날 자료만. 프로젝트·챌린지는 날짜와 상관없으니 처음 한 번
        React.useEffect(() => {
            fetchDailyData(authFetch, selectedDate);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedDate]);
        React.useEffect(() => {
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        React.useEffect(() => {
            setLocalMemo(memo || "");
        }, [memo]);

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
                                    // 하루 안에 시작해 끝나는 태스크만 시간대에 놓는다. 며칠에 걸친 태스크를
                                    // 시간대에 넣으면 그 기간 매일 00~24시가 막대로 꽉 차서 타임라인이 쓸모없어진다.
                                    // 그런 건 위 "할 일" 목록에 '하루 종일' 로 선다.
                                    isAllDay: !task.startAt || !task.endAt
                                        || localDateKey(task.startAt) !== localDateKey(task.endAt),
                                    repeat: 0,
                                    memo: task.description || null,
                                    check: isTaskCompleted ? 'done' : 'none',
                                    completions: [],
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

        const expandedTodos = useExpandedTodos(filteredTodos, selectedDate, selectedDate) as CalendarTodoType[];

        // 선택한 날짜에 해당하는 챌린지 (월간·주간과 동일한 간격/목표횟수 규칙)
        const dayChallenges = React.useMemo<DayChallengeItem[]>(() => {
            const current = new Date(selectedDate);
            current.setHours(0, 0, 0, 0);
            const key = (d: Date) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const currentStr = key(current);

            return challenges.reduce<DayChallengeItem[]>((acc, challenge) => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return acc;

                const start = new Date(challenge.startAt);
                start.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((current.getTime() - start.getTime()) / 86400000);
                if (diffDays < 0 || diffDays % challenge.interval !== 0) return acc;

                const occurrence = Math.floor(diffDays / challenge.interval) + 1;
                if (challenge.targetCount != null && occurrence > challenge.targetCount) return acc;

                const isDone = (challenge.completions ?? []).some(
                    comp => key(new Date(comp.targetDate)) === currentStr
                );

                acc.push({
                    id: `challenge-${challenge.id}-${current.getTime()}`,
                    challengeId: challenge.id,
                    title: challenge.title,
                    isDone,
                });
                return acc;
            }, []);
        }, [challenges, selectedCategoryIds, selectedDate]);

        const handleToggleChallenge = React.useCallback((item: DayChallengeItem) => {
            const target = new Date(selectedDate);
            target.setHours(0, 0, 0, 0);
            const offset = target.getTimezoneOffset() * 60000;
            const targetDate = new Date(target.getTime() - offset).toISOString().split('T')[0] + 'T00:00:00.000Z';
            toggleChallengeCompletion(authFetch, item.challengeId, targetDate);
        }, [authFetch, selectedDate, toggleChallengeCompletion]);

        const handleAddTask = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTaskText.trim()) return;
            const text = newTaskText.trim();
            setNewTaskText("");
            await addDailyTask(authFetch, selectedDate, text);
        };

        const handleMemoBlur = async () => {
            if (localMemo !== memo) {
                const error = await updateDailyMemo(authFetch, selectedDate, localMemo);
                setMemoError(error);
            }
        };

        const getSlotTodos = React.useCallback((hour: number, slotIdx: number) => {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, slotIdx * 10, 0, 0);

            const slotEnd = new Date(selectedDate);
            slotEnd.setHours(hour, slotIdx * 10 + 9, 59, 999);

            return expandedTodos.filter(todo => {
                if (todo.isAllDay || !todo.startAt || !todo.endAt) return false;
                const start = new Date(todo.startAt as string | number | Date);
                const end = new Date(todo.endAt as string | number | Date);
                return start <= slotEnd && end >= slotStart;
            });
        }, [expandedTodos, selectedDate]);

        const hours = Array.from({ length: 24 }, (_, i) => i);
        const formattedDate = t.calendar.dayTitle(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate());

        /* ── 이 날의 일정 목록 ────────────────────────────────────────────
           폰에서는 달력 칸이 48px 라 일정이 6px 짜리 마름모로만 찍힌다.
           고치거나 지우려면 집을 수 있는 목록이 있어야 한다. */
        const dayTodos = React.useMemo(() => {
            const at = (v: unknown) => new Date(v as string | number | Date).getTime();
            // useExpandedTodos 는 반복 없는 일정을 창(window)과 무관하게 전부 돌려준다.
            // 여기서 이 날에 걸리는 것만 골라내지 않으면 남의 날 일정까지 목록에 선다.
            return expandedTodos
                .filter(todo => isBetween(selectedDate, todo.startAt, todo.endAt))
                .sort((a, b) => {
                    if (!!a.isAllDay !== !!b.isAllDay) return a.isAllDay ? -1 : 1;
                    return at(a.startAt) - at(b.startAt);
                });
        }, [expandedTodos, selectedDate]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [contextMenu, setContextMenu] =
            React.useState<{ x: number; y: number; todo: CalendarTodoType } | null>(null);

        const openTodoMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            e.stopPropagation();
            const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu({ x: box.left + box.width / 2, y: box.bottom, todo });
        };

        const isForeign = (todo: CalendarTodoType) => !!todo.isProject || !!todo.isProjectTask;

        const handleQuickEdit = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                await dialog.notify({ title: t.alert.editHereTitle, message: t.alert.editHereMsg });
                return;
            }
            setModalTodo(todo.originalTodo || (todo as unknown as TodoType));
            setIsModalOpen(true);
        };

        const handleQuickDelete = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                await dialog.notify({ title: t.alert.deleteHereTitle, message: t.alert.deleteHereDetailMsg });
                return;
            }
            const ok = await dialog.confirmDanger({
                title: t.alert.deleteTodoTitle,
                message: (todo.originalTodo?.repeat ?? todo.repeat ?? 0) > 0 ? t.alert.deleteTodoMsg : t.alert.deleteTodoOnceMsg,
            });
            if (!ok) return;
            const error = await deleteTodo(authFetch, todo.originalTodo?.id || todo.id);
            if (error) await dialog.notify({ title: t.alert.deleteFailed, message: error });
        };

        const handleQuickDeleteOne = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) return;
            const ok = await dialog.confirm({
                title: t.alert.deleteOneDayTitle,
                message: t.alert.deleteOneDayMsg,
                confirmLabel: t.dialog.delete,
            });
            if (!ok) return;
            // 완료·삭제 기록은 그 회차의 날짜에 붙는다. 보고 있는 날이 아니다.
            const occurrence = todo.date ?? new Date(todo.startAt || Date.now());
            await deleteTodoOccurrence(authFetch, todo.originalTodo?.id || todo.id, localDateKey(occurrence));
        };

        const handleQuickToggle = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                await dialog.notify({ title: t.alert.statusHereTitle, message: t.alert.statusHereMsg });
                return;
            }
            const occurrence = todo.date ?? new Date(todo.startAt || Date.now());
            await toggleTodo(authFetch, todo.originalTodo?.id || todo.id, occurrence.toISOString());
        };

        const handleToggleTask = (task: { id: string; title: string; isDone: boolean }) => toggleDailyTask(authFetch, task.id);
        const handleDeleteTask = (task: { id: string; title: string; isDone: boolean }) => deleteDailyTask(authFetch, task.id);

        // 서버가 title 로 주는 판과 text 로 주는 판이 섞여 있어 둘 다 받는다.
        const mappedTasks = tasks.map((t: { id: string; title?: string; text?: string; isDone: boolean }) => ({
            id: t.id,
            title: t.title || t.text || "",
            isDone: t.isDone
        }));

        const toggleCategory = (categoryId: string) => {
            setSelectedCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const themeProps: DayThemeProps = {
            asChild,
            formattedDate,
            dayChallenges,
            toggleChallenge: handleToggleChallenge,
            hours,
            getSlotTodos,
            tasks: mappedTasks,
            newTaskText,
            setNewTaskText,
            handleAddTask,
            toggleDailyTask: handleToggleTask,
            deleteDailyTask: handleDeleteTask,
            localMemo,
            setLocalMemo,
            handleMemoBlur,
            memoError,
            categories,
            selectedCategoryIds,
            toggleCategory,
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev),

            dayTodos,
            selectedDate,
            isModalOpen,
            modalTodo,
            setIsModalOpen,
            contextMenu,
            setContextMenu,
            openTodoMenu,
            handleQuickEdit,
            handleQuickDelete,
            handleQuickDeleteOne,
            handleQuickToggle,
        };

        return (
            <>
                <DayCalendarView ref={ref} {...themeProps} {...props} />
            </>
        );
    }
);

DayCalendar.displayName = "DayCalendar";

export default DayCalendar;