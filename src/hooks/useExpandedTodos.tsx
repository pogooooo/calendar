import { useMemo } from 'react';
import type { TodoType } from '@/types';
import { localDateKey, utcDayKey, parseExcludedDates } from '@/lib/dateKey';

export interface ExpandedTodoType extends TodoType {
    originalTodo?: TodoType;
    date?: Date;
    isDone?: boolean;
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
                const dateStr = localDateKey(todo.startAt);
                // 완료 기록은 서버가 UTC 자정으로 저장하므로 UTC 로 읽어야 키가 맞는다
                const isDone = todo.completions?.some(c =>
                    utcDayKey(c.targetDate) === dateStr
                );

                expanded.push({
                    ...todo,
                    originalTodo: todo,
                    date: new Date(todo.startAt),
                    isDone: isDone || false
                });
                return;
            }

            const R = todo.repeat;
            const excluded = parseExcludedDates(todo.excludedDates);
            const currentStart = new Date(todo.startAt);
            const currentEnd = new Date(todo.endAt);

            const startDayOnly = new Date(currentStart);
            startDayOnly.setHours(0, 0, 0, 0);
            const endDayOnly = new Date(currentEnd);
            endDayOnly.setHours(0, 0, 0, 0);

            // UI 의 '반복 주기 N일마다' 는 발생 간격 그 자체다.
            // 일정 길이를 더하면 날짜를 넘기는 일정의 반복이 그만큼 밀린다.
            const intervalDays = Math.max(1, Math.round(R));
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

                if (currentEnd.getTime() >= startLimit.getTime() && !excluded.includes(localDateKey(currentStart))) {
                    const dateStr = localDateKey(currentStart);
                    const isDone = todo.completions?.some(c =>
                        utcDayKey(c.targetDate) === dateStr
                    );

                    expanded.push({
                        ...todo,
                        id: `${todo.id}-rep-${currentStart.getTime()}`,
                        startAt: currentStart.toISOString(),
                        endAt: currentEnd.toISOString(),
                        originalTodo: todo,
                        date: new Date(currentStart),
                        isDone: isDone || false
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