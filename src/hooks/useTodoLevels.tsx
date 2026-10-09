import { useMemo } from 'react';
import type { TodoType } from '@/types';
import { labelKey, localDateKey, endDateKey } from '@/lib/dateKey';

export const useTodoLevels = (todos: TodoType[], weekDates: Date[]) => {
    return useMemo(() => {
        // 주의 첫날 ~ 끝날을 날 키로 — 칸 Date 의 날(labelKey)과 일정이 걸친 고른 시간대의 날(localDateKey·endDateKey).
        // 주간 위젯의 날짜들은 지금 시각을 달고 와서, 예전처럼 순간을 그대로 견주면 일요일 이 시각 전에 끝나는 일정이 층을 못 받았고,
        // 이 기기 0시로 자르면 기기와 고른 시간대가 다를 때 칸과 층이 하루 어긋났다
        const weekFrom = labelKey(weekDates[0]);
        const weekTo = labelKey(weekDates[6]);
        const days = new Map<string, { from: string; to: string }>();
        todos.forEach(todo => {
            if (todo.startAt && todo.endAt) days.set(todo.id, { from: localDateKey(todo.startAt), to: endDateKey(todo.startAt, todo.endAt) });
        });

        const currentWeekTodos = todos.filter(todo => {
            const span = days.get(todo.id);
            return !!span && span.from <= weekTo && span.to >= weekFrom;
        });

        const sortedTodos = [...currentWeekTodos].sort((a, b) => {
            const startDiff = new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime();
            if (startDiff !== 0) return startDiff;
            const aLen = new Date(a.endAt!).getTime() - new Date(a.startAt!).getTime();
            const bLen = new Date(b.endAt!).getTime() - new Date(b.startAt!).getTime();
            return bLen - aLen;
        });

        const levels: string[][] = [];
        const todoToLevelMap: Record<string, number> = {};

        sortedTodos.forEach(todo => {
            let assignedLevel = -1;
            const todoStart = days.get(todo.id)!.from;

            for (let i = 0; i < levels.length; i++) {
                const lastTodoIdInLevel = levels[i][levels[i].length - 1];
                const lastTodo = currentWeekTodos.find(t => t.id === lastTodoIdInLevel);
                if (lastTodo) {
                    const lastTodoEnd = days.get(lastTodo.id)!.to;
                    if (lastTodoEnd < todoStart) {
                        assignedLevel = i;
                        break;
                    }
                }
            }

            if (assignedLevel === -1) {
                assignedLevel = levels.length;
                levels.push([todo.id]);
            } else {
                levels[assignedLevel].push(todo.id);
            }
            todoToLevelMap[todo.id] = assignedLevel;
        });

        return { todoLevels: todoToLevelMap, maxLevel: levels.length };
    }, [todos, weekDates]);
};