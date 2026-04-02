import { create } from 'zustand';

export interface TodoType {
    id: string;
    title: string;
    categoryId: string;
    check: "done" | "none";
    memo?: string | null;
    startAt?: string | number | Date | null;
    endAt?: string | number | Date | null;
    isAllDay: boolean;
    location?: string | null;
    repeat: number;
}

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface TodoState {
    todos: TodoType[];
    isLoading: boolean;
    error: string | null;

    fetchTodos: (authFetch: AuthFetch, params?: { start?: string, end?: string, categoryId?: string }) => Promise<void>;
    toggleTodo: (authFetch: AuthFetch, todoId: string) => Promise<void>;
    addTodo: (authFetch: AuthFetch, data: Partial<TodoType>) => Promise<void>;
    updateTodo: (authFetch: AuthFetch, todoId: string, data: Partial<TodoType>) => Promise<void>;
    deleteTodo: (authFetch: AuthFetch, todoId: string) => Promise<void>;
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
                const query = new URLSearchParams(params as any).toString();
                url += `?${query}`;
            }
            const res = await authFetch(url);
            if (!res.ok) throw new Error("할 일 데이터를 불러오는 데 실패했습니다.");

            const todos = await res.json();
            set({ todos, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            set({ error: message, isLoading: false });
            console.error("[TODO_FETCH_ERROR]", err);
        }
    },

    toggleTodo: async (authFetch, todoId) => {
        const previousTodos = get().todos;
        const target = previousTodos.find(t => t.id === todoId);
        if (!target) return;

        const newStatus = target.check === "done" ? "none" : "done";

        set((state) => ({
            todos: state.todos.map(t => t.id === todoId ? { ...t, check: newStatus } : t)
        }));

        try {
            const res = await authFetch('/api/todo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todoId, check: newStatus }),
            });
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
            check: "none",
            isAllDay: data.isAllDay || false,
            memo: data.memo || null,
            location: data.location || null,
            repeat: data.repeat || 0,
            startAt: data.startAt || new Date().toISOString(),
            endAt: data.endAt || new Date().toISOString(),
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
                // 임시 ID를 서버에서 생성된 실제 ID로 교체
                set((state) => ({
                    todos: state.todos.map(t => t.id === tempId ? serverTodo : t)
                }));
            } else {
                throw new Error();
            }
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_ADD_ERROR]", err);
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
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ todos: previousTodos });
            console.error("[TODO_UPDATE_ERROR]", err);
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
    }
}));

export default useTodoStore;