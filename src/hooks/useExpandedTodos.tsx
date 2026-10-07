import { useMemo } from 'react';
import type { TodoType } from '@/types';
import { localDateKey, utcDayKey, parseExcludedDates } from '@/lib/dateKey';

export interface ExpandedTodoType extends TodoType {
    originalTodo?: TodoType;
    date?: Date;
    isDone?: boolean;
}

/**
 * 반복 일정을 창 안의 발생으로 펼친다 (훅이 아니라 순수 함수).
 * 화면은 useExpandedTodos 로, 안드로이드 위젯 자료처럼 렌더 밖에서 쓰는 곳은 이걸 직접 부른다.
 */
export function expandTodos(
    todos: TodoType[],
    windowStart: Date | undefined,
    windowEnd: Date | undefined
): ExpandedTodoType[] {
        const expanded: ExpandedTodoType[] = [];

        if (!todos || todos.length === 0 || !windowStart || !windowEnd) return expanded;

        const startLimit = new Date(windowStart);
        startLimit.setHours(0, 0, 0, 0);
        const endLimit = new Date(windowEnd);
        endLimit.setHours(23, 59, 59, 999);

        todos.forEach(todo => {
            if (!todo.startAt || !todo.endAt) return;

            if (!todo.repeat || todo.repeat <= 0) {
                /**
                 * 반복 없는 일정도 창 밖이면 버린다.
                 * 예전에는 무조건 넣었다 — 쓰는 쪽(월간은 칸마다, 일간은 시간대별로)이
                 * 한 번 더 걸러서 안 드러났을 뿐이다. 그래서 일간 화면에 일정 목록을
                 * 붙였을 때 9월 8일 자리에 9월 7일 일정이 같이 섰다.
                 * 일정이 쌓일수록 헛도는 계산도 같이 는다.
                 */
                const start = new Date(todo.startAt);
                const end = new Date(todo.endAt);
                if (end.getTime() < startLimit.getTime() || start.getTime() > endLimit.getTime()) return;

                const dateStr = localDateKey(todo.startAt);
                // 완료 기록은 서버가 UTC 자정으로 저장하므로 UTC 로 읽어야 키가 맞는다
                const isDone = todo.completions?.some(c =>
                    utcDayKey(c.targetDate) === dateStr
                );

                expanded.push({
                    ...todo,
                    originalTodo: todo,
                    date: new Date(todo.startAt),
                    // 프로젝트·할 일은 완료 기록이 없고 상태로 끝남을 들고 온다 (src/lib/projectCalendar.ts).
                    // 그걸 completions 로 다시 셈하면 끝낸 할 일이 달력에서 늘 안 끝난 것으로 보였다
                    isDone: isDone || !!(todo as ExpandedTodoType).isDone
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
}

export const useExpandedTodos = (
    todos: TodoType[],
    windowStart: Date | undefined,
    windowEnd: Date | undefined
) => {
    return useMemo(() => expandTodos(todos, windowStart, windowEnd), [todos, windowStart, windowEnd]);
};