import { useMemo } from 'react';
import type { TodoType } from '@/types';
import { localDateKey, utcDayKey, parseExcludedDates, activeTimeZone, sameAsDevice, zonedTime } from '@/lib/dateKey';
import { addDaysToKey, zonedTimeToDate, zonedWallTime, type WallTime } from '@/lib/timezone';
import { isOccurrenceDone } from '@/lib/todoDone';

export interface ExpandedTodoType extends TodoType {
    originalTodo?: TodoType;
    date?: Date;
    isDone?: boolean;
}

/**
 * 반복 일정을 창 안의 발생으로 펼친다 (훅이 아니라 순수 함수).
 * 화면은 useExpandedTodos 로, 안드로이드 위젯 자료처럼 렌더 밖에서 쓰는 곳은 이걸 직접 부른다.
 * 창은 windowStart 가 놓이는 날 0시 ~ windowEnd 가 놓이는 날 끝 — 고른 시간대의 날이고, 실제 순간을 받는다
 * (달력 칸 Date 는 zonedTime(labelKey(칸)) 으로 바꿔 넘긴다).
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
        // 기기와 다른 시간대를 골랐으면 창도 고른 시간대의 날로 — 예전엔 이 기기의 날로 잘라서 그 날 일정이 빠지거나 하루 밀렸다.
        // 같은 시간대면 위의 예전 셈 그대로다
        const tz = activeTimeZone();
        const device = sameAsDevice(tz);
        if (!device) {
            startLimit.setTime(zonedTime(localDateKey(windowStart)).getTime());
            endLimit.setTime(zonedTime(addDaysToKey(localDateKey(windowEnd), 1)).getTime() - 1);
        }

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

                // 여러 날 일정은 한 번 끝낸다 — 첫날 기록, 예전에 가운데 날에 적힌 기록도 센다 (src/lib/todoDone.ts)
                const isDone = isOccurrenceDone(todo);

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

            /* 회차를 날 수만큼 민다. 기기와 같은 시간대면 예전처럼 이 기기 Date 의 setDate(그 벽시계를 지킨다),
               다르면 첫 회차의 고른 시간대 벽시계를 그 날에 다시 맞춘다 — 기기의 서머타임을 따라 9시 회차가 8시·10시로 밀리지 않게 */
            const first = device || Number.isNaN(currentStart.getTime() + currentEnd.getTime()) ? null : {
                startKey: localDateKey(currentStart), start: zonedWallTime(currentStart, tz)!, startMs: currentStart.getMilliseconds(),
                endKey: localDateKey(currentEnd), end: zonedWallTime(currentEnd, tz)!, endMs: currentEnd.getMilliseconds(),
            };
            let shiftedDays = 0;
            const advance = (days: number) => {
                if (!first) {
                    currentStart.setDate(currentStart.getDate() + days);
                    currentEnd.setDate(currentEnd.getDate() + days);
                    return;
                }
                shiftedDays += days;
                // 대개는 그사이 시차가 그대로라 날 수 × 24시간이면 같은 벽시계다 — 아닐 때(서머타임이 바뀐 사이)만 그 날의 벽시계로 다시 잰다
                const at = (prev: Date, key: string, w: WallTime, ms: number) => {
                    const guess = prev.getTime() + days * 86400000;
                    const g = zonedWallTime(guess, tz);
                    if (g && g.hour === w.hour && g.minute === w.minute && g.second === w.second) return guess;
                    return zonedTimeToDate(addDaysToKey(key, shiftedDays), w.hour, w.minute, tz, w.second, ms)!.getTime();
                };
                currentStart.setTime(at(currentStart, first.startKey, first.start, first.startMs));
                currentEnd.setTime(at(currentEnd, first.endKey, first.end, first.endMs));
            };

            // 반복이 끝나는 날의 끝 — 고른 시간대의 그 날 (TodoModal 이 그 날 0시로 적는다). 같은 시간대면 예전 셈 그대로
            const repeatUntil = todo.repeatEndDate ? new Date(todo.repeatEndDate) : null;
            if (repeatUntil) {
                repeatUntil.setHours(23, 59, 59, 999);
                if (!device) repeatUntil.setTime(zonedTime(addDaysToKey(localDateKey(todo.repeatEndDate!), 1)).getTime() - 1);
            }

            let globalInstanceCount = 0;

            if (currentEnd.getTime() < startLimit.getTime()) {
                const msBefore = startLimit.getTime() - currentEnd.getTime();
                const intervalsToSkip = Math.floor(msBefore / repeatIntervalMs);
                if (intervalsToSkip > 0) {
                    advance(intervalsToSkip * intervalDays);
                    globalInstanceCount += intervalsToSkip;
                }
            }

            let instanceCount = 0;
            while (currentStart.getTime() <= endLimit.getTime()) {

                if (todo.repeatCount && globalInstanceCount >= todo.repeatCount) break;

                if (repeatUntil && currentStart.getTime() > repeatUntil.getTime()) break;

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

                advance(intervalDays);

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