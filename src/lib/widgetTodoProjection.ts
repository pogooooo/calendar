import { expandTodos } from '@/hooks/useExpandedTodos';
import type { TodoType } from '@/types';
import { doneKeysIn } from './todoDone';
import { zonedDateKey } from './timezone';
import { lastInstant } from './dateKey';

export function widgetTodos(todos: TodoType[], categories: { id: string; color: string }[], start: Date, end: Date, timeZone: string) {
    return expandTodos(todos, start, end, timeZone)
        .filter(todo => lastInstant(todo.startAt!, todo.endAt!) >= start.getTime() && new Date(todo.startAt!).getTime() <= end.getTime())
        .map(todo => ({
        id: todo.originalTodo?.id ?? todo.id.replace(/-rep-\d+$/, ''),
        title: todo.title, startAt: new Date(todo.startAt!).toISOString(), endAt: new Date(todo.endAt!).toISOString(),
        allDay: !!todo.isAllDay, done: !!todo.isDone,
        color: categories.find(category => category.id === todo.categoryId)?.color ?? '#808080',
        completionDate: zonedDateKey(todo.startAt!, timeZone),
        doneKeys: doneKeysIn(todo, timeZone), categoryId: todo.categoryId,
    }));
}
