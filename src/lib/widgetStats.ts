import { localDateKey, endDateKey } from '@/lib/dateKey';
import { isOccurrenceDone } from '@/lib/todoDone';
import { addDaysToKey } from '@/lib/timezone';

type StatsTodo = {
    categoryId?: string | null;
    startAt?: string | number | Date | null;
    endAt?: string | number | Date | null;
    repeat?: number | null;
    completions?: { targetDate: string | Date }[];
};

/** Count scheduled days consistently for both the weekly total and category rows. */
export function weeklyTaskStats(todos: StatsTodo[], weekStart: string) {
    let total = 0;
    let done = 0;
    const categories = new Map<string, { total: number; done: number }>();
    for (const todo of todos) {
        if (!todo.startAt || !todo.endAt) continue;
        const start = localDateKey(todo.startAt);
        const end = endDateKey(todo.startAt, todo.endAt);
        // 여러 날 일정은 한 번 끝낸다 — 끝냈으면 그 회차의 날이 모두 끝난 날로 센다 (src/lib/todoDone.ts)
        const finished = isOccurrenceDone(todo);
        for (let day = 0; day < 7; day++) {
            const key = addDaysToKey(weekStart, day);
            if (key < start || key > end) continue;
            const count = finished ? 1 : 0;
            total++;
            done += count;
            if (todo.categoryId) {
                const category = categories.get(todo.categoryId) ?? { total: 0, done: 0 };
                category.total++;
                category.done += count;
                categories.set(todo.categoryId, category);
            }
        }
    }
    return { total, done, categories };
}
