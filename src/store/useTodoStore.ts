import { create } from 'zustand';
import type { AuthFetch, TodoType, TodoCompletionType } from '@/types';
import { toUtcAnchorIso, utcDayKey } from '@/lib/dateKey';

export type { TodoType, TodoCompletionType };

interface TodoState {
    todos: TodoType[];
    isLoading: boolean;
    error: string | null;

    fetchTodos: (authFetch: AuthFetch, params?: { start?: string; end?: string; categoryId?: string }) => Promise<void>;
    toggleTodo: (authFetch: AuthFetch, todoId: string, targetDate: string) => Promise<void>;
    addTodo: (authFetch: AuthFetch, data: Partial<TodoType>) => Promise<string | null>;
    updateTodo: (authFetch: AuthFetch, todoId: string, data: Partial<TodoType>) => Promise<string | null>;
    deleteTodo: (authFetch: AuthFetch, todoId: string) => Promise<void>;
    deleteTodoOccurrence: (authFetch: AuthFetch, todoId: string, dateKey: string) => Promise<void>;
}

const useTodoStore = create<TodoState>((set, get) => ({
    todos: [],
    isLoading: false,
    error: null,

    fetchTodos: async (authFetch, params) => {
        set({ isLoading: true, error: null });
        try {
            let url = '/api/todo';
            if (params) {
                const query = new URLSearchParams();
                if (params.start) query.append('start', params.start);
                if (params.end) query.append('end', params.end);
                if (params.categoryId) query.append('categoryId', params.categoryId);
                const qs = query.toString();
                if (qs) url += `?${qs}`;
            }

            const res = await authFetch(url);
            if (res.status === 401) { set({ isLoading: false }); return; }
            if (!res.ok) throw new Error("할 일 데이터를 불러오는 데 실패했습니다.");

            const todos = await res.json();
            set({ todos, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            if (message === "Session expired") { set({ isLoading: false }); return; }
            set({ error: message, isLoading: false });
            console.error("[TODO_FETCH_ERROR]", err);
        }
    },

    toggleTodo: async (authFetch, todoId, targetDate) => {
        const previousTodos = get().todos;
        const target = previousTodos.find(t => t.id === todoId);
        if (!target) return;

        // 호출부가 순간(instant)을 넘기든 날짜를 넘기든, 사용자의 시간대 기준 달력일로 통일한다.
        // 그러지 않으면 KST 오전 9시 이전 일정이 전날로 기록돼 체크가 유지되지 않는다.
        const anchorIso = toUtcAnchorIso(targetDate);
        const targetDateStr = anchorIso.slice(0, 10);

        const isCompleted = target.completions?.some(c =>
            utcDayKey(c.targetDate) === targetDateStr
        );

        const newCompletions = isCompleted
            ? (target.completions ?? []).filter(c =>
                utcDayKey(c.targetDate) !== targetDateStr
              )
            : [...(target.completions ?? []), { targetDate: anchorIso }];

        set((state) => ({
            todos: state.todos.map(t => t.id === todoId ? { ...t, completions: newCompletions } : t)
        }));

        try {
            const res = await authFetch('/api/todo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todoId, targetDate: anchorIso }),
            });
            if (res.status === 401) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_TOGGLE_ERROR]", err);
        }
    },

    addTodo: async (authFetch, data) => {
        const previousTodos = get().todos;
        const tempId = `temp-${Date.now()}`;

        const newTodo: TodoType = {
            id: tempId,
            title: data.title || "새 할 일",
            categoryId: data.categoryId || "",
            completions: [],
            isAllDay: data.isAllDay || false,
            memo: data.memo ?? null,
            location: data.location ?? null,
            repeat: data.repeat || 0,
            startAt: data.startAt || new Date().toISOString(),
            endAt: data.endAt || new Date().toISOString(),
            repeatEndDate: data.repeatEndDate ?? null,
            repeatCount: data.repeatCount ?? null,
        };

        set((state) => ({ todos: [newTodo, ...state.todos] }));

        try {
            const res = await authFetch('/api/todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const serverTodo = await res.json();
                set((state) => ({
                    todos: state.todos.map(t => t.id === tempId ? serverTodo : t)
                }));
                return null;
            }
            const body = await res.json().catch(() => null);
            set({ todos: previousTodos });
            return body?.message ?? "할 일 등록에 실패했습니다.";
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_ADD_ERROR]", err);
            return "할 일 등록 중 오류가 발생했습니다.";
        }
    },

    updateTodo: async (authFetch, todoId, data) => {
        const previousTodos = get().todos;
        set((state) => ({
            todos: state.todos.map(t => t.id === todoId ? { ...t, ...data } : t)
        }));

        try {
            const res = await authFetch('/api/todo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todoId, ...data }),
            });
            if (res.ok) return null;
            const body = await res.json().catch(() => null);
            set({ todos: previousTodos });
            return body?.message ?? "할 일 수정에 실패했습니다.";
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_UPDATE_ERROR]", err);
            return "할 일 수정 중 오류가 발생했습니다.";
        }
    },

    deleteTodo: async (authFetch, todoId) => {
        const previousTodos = get().todos;
        set((state) => ({ todos: state.todos.filter(t => t.id !== todoId) }));

        try {
            const res = await authFetch(`/api/todo?id=${todoId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_DELETE_ERROR]", err);
        }
    },

    deleteTodoOccurrence: async (authFetch, todoId, dateKey) => {
        const previousTodos = get().todos;

        set((state) => ({
            todos: state.todos.map(t => {
                if (t.id !== todoId) return t;
                let excluded: string[] = [];
                try {
                    const parsed = JSON.parse(t.excludedDates ?? "[]");
                    if (Array.isArray(parsed)) excluded = parsed;
                } catch {}
                if (!excluded.includes(dateKey)) excluded.push(dateKey);
                return { ...t, excludedDates: JSON.stringify(excluded) };
            })
        }));

        try {
            const res = await authFetch(`/api/todo?id=${todoId}&targetDate=${dateKey}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            const serverTodo = await res.json();
            if (serverTodo?.id) {
                set((state) => ({
                    todos: state.todos.map(t => t.id === todoId ? serverTodo : t)
                }));
            }
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_DELETE_OCCURRENCE_ERROR]", err);
        }
    }
}));

export default useTodoStore;
