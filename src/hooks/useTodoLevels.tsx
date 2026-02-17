import { useMemo } from 'react';
import { TodoType } from '@/components/calendar/weekCalendar/WeekCalendar';

export const useTodoLevels = (todos: TodoType[], weekDates: Date[]) => {
    return useMemo(() => {
        const weekStart = weekDates[0].getTime();
        const weekEnd = weekDates[6].getTime() + 86399999;

        const currentWeekTodos = todos.filter(todo => {
            if (!todo.startAt || !todo.endAt) return false;
            const s = new Date(todo.startAt).getTime();
            const e = new Date(todo.endAt).getTime();
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
                    const lastTodoEnd = new Date(lastTodo.endAt!).setHours(0, 0, 0, 0);
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