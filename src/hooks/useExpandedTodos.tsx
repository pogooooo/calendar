import { useMemo } from 'react';
import { TodoType } from '@/store/useTodoStore';

export interface ExpandedTodoType extends TodoType {
    originalTodo?: TodoType;
}

export const useExpandedTodos = (
    todos: TodoType[],
    windowStart: Date | undefined,
    windowEnd: Date | undefined
) => {
    return useMemo(() => {
        const expanded: ExpandedTodoType[] = [];

        if (!todos || todos.length === 0 || !windowStart || !windowEnd) return expanded;

        const startLimit = new Date(windowStart);
        startLimit.setHours(0, 0, 0, 0);
        const endLimit = new Date(windowEnd);
        endLimit.setHours(23, 59, 59, 999);

        todos.forEach(todo => {
            if (!todo.startAt || !todo.endAt) return;

            if (!todo.repeat || todo.repeat <= 0) {
                expanded.push(todo);
                return;
            }

            const R = todo.repeat;
            const currentStart = new Date(todo.startAt);
            const currentEnd = new Date(todo.endAt);

            const startDayOnly = new Date(currentStart);
            startDayOnly.setHours(0, 0, 0, 0);
            const endDayOnly = new Date(currentEnd);
            endDayOnly.setHours(0, 0, 0, 0);

            const daysBetween = Math.round((endDayOnly.getTime() - startDayOnly.getTime()) / (1000 * 60 * 60 * 24));
            const intervalDays = daysBetween + R;
            const repeatIntervalMs = intervalDays * 24 * 60 * 60 * 1000;

            let globalInstanceCount = 0;

            if (currentEnd.getTime() < startLimit.getTime()) {
                const msBefore = startLimit.getTime() - currentEnd.getTime();
                const intervalsToSkip = Math.floor(msBefore / repeatIntervalMs);
                if (intervalsToSkip > 0) {
                    currentStart.setDate(currentStart.getDate() + (intervalsToSkip * intervalDays));
                    currentEnd.setDate(currentEnd.getDate() + (intervalsToSkip * intervalDays));
                    globalInstanceCount += intervalsToSkip;
                }
            }

            let instanceCount = 0;
            while (currentStart.getTime() <= endLimit.getTime()) {

                if (todo.repeatCount && globalInstanceCount >= todo.repeatCount) break;

                if (todo.repeatEndDate) {
                    const endDateLimit = new Date(todo.repeatEndDate);
                    endDateLimit.setHours(23, 59, 59, 999);
                    if (currentStart.getTime() > endDateLimit.getTime()) break;
                }

                if (currentEnd.getTime() >= startLimit.getTime()) {
                    expanded.push({
                        ...todo,
                        id: `${todo.id}-rep-${currentStart.getTime()}`,
                        startAt: currentStart.toISOString(),
                        endAt: currentEnd.toISOString(),
                        originalTodo: todo
                    });
                }

                currentStart.setDate(currentStart.getDate() + intervalDays);
                currentEnd.setDate(currentEnd.getDate() + intervalDays);

                globalInstanceCount++;
                instanceCount++;
                if (instanceCount > 1000) break;
            }
        });

        return expanded;
    }, [todos, windowStart, windowEnd]);
};