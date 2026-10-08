import { useMemo } from 'react';
import type { TodoType } from '@/types';
import { lastInstant } from '@/utils/DateUtils';

export const useTodoLevels = (todos: TodoType[], weekDates: Date[]) => {
    return useMemo(() => {
        // 주의 첫날 0시 ~ 끝날 23:59:59. 주간 위젯의 날짜들은 지금 시각을 달고 와서(getWeekDates(new Date())),
        // 예전처럼 그대로 쓰면 일요일 이 시각 전에 끝나는 일정이 층을 못 받아 칸에서 사라졌다
        const weekStart = new Date(weekDates[0]).setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekDates[6]).setHours(23, 59, 59, 999);

        const currentWeekTodos = todos.filter(todo => {
            if (!todo.startAt || !todo.endAt) return false;
            const s = new Date(todo.startAt).getTime();
            const e = lastInstant(todo.startAt, todo.endAt);
            return (s <= weekEnd && e >= weekStart);
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
            const todoStart = new Date(todo.startAt!).setHours(0, 0, 0, 0);

            for (let i = 0; i < levels.length; i++) {
                const lastTodoIdInLevel = levels[i][levels[i].length - 1];
                const lastTodo = currentWeekTodos.find(t => t.id === lastTodoIdInLevel);
                if (lastTodo) {
                    const lastTodoEnd = new Date(lastInstant(lastTodo.startAt!, lastTodo.endAt!)).setHours(0, 0, 0, 0);
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