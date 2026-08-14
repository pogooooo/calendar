"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialDayCalendar from "./celestial/CelestialDayCalendar";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
}

export interface DayProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
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

    categories: CategoryType[];
    selectedCategoryIds: string[];
    toggleCategory: (categoryId: string) => void;
    showProjects: boolean;
    onToggleProjects: () => void;
}

const DayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild = false, selectedDate = new Date(), todos = [], categories = [], onDateChange, ...props }, ref) => {
        const theme = useTheme();
        const themeName = theme?.name || 'celestial';

        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
        const [showProjects, setShowProjects] = React.useState(true);

        const { tasks, memo, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask, updateDailyMemo } = useDailyStore();
        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
        const authFetch = useAuthFetch();

        const [newTaskText, setNewTaskText] = React.useState("");
        const [localMemo, setLocalMemo] = React.useState("");

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        }, [categories]);

        React.useEffect(() => {
            fetchDailyData(authFetch, selectedDate);
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedDate]);

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
                                    isAllDay: false, // ✨ 중요: 일간 타임라인에 보이려면 false여야 시간 계산이 됨
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
                await updateDailyMemo(authFetch, selectedDate, localMemo);
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
        const formattedDate = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

        const handleToggleTask = (task: { id: string; title: string; isDone: boolean }) => toggleDailyTask(authFetch, task.id);
        const handleDeleteTask = (task: { id: string; title: string; isDone: boolean }) => deleteDailyTask(authFetch, task.id);

        const mappedTasks = tasks.map((t: any) => ({
            id: t.id,
            title: t.title || t.text,
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
            categories,
            selectedCategoryIds,
            toggleCategory,
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev)
        };

        return (
            <>
                <CelestialDayCalendar ref={ref} {...themeProps} {...props} />
            </>
        );
    }
);

DayCalendar.displayName = "DayCalendar";

export default DayCalendar;