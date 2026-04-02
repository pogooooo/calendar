import { create } from 'zustand';
import useAuthStore from '@/store/useAuthStore';

export interface DailyTaskType {
    id: string;
    text: string;
    isDone: boolean;
    date: string | Date;
}

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface DailyState {
    tasks: DailyTaskType[];
    memo: string;
    isLoading: boolean;
    error: string | null;

    fetchDailyData: (authFetch: AuthFetch, date: Date) => Promise<void>;

    addDailyTask: (authFetch: AuthFetch, date: Date, text: string) => Promise<void>;
    toggleDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;
    deleteDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;

    updateDailyMemo: (authFetch: AuthFetch, date: Date, content: string) => Promise<void>;
}

const useDailyStore = create<DailyState>((set, get) => ({
    tasks: [],
    memo: "",
    isLoading: false,
    error: null,

    fetchDailyData: async (authFetch, date) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
            const dateStr = date.toISOString();

            const [taskRes, memoRes] = await Promise.all([
                authFetch(`/api/dailyTask?date=${dateStr}&userId=${userId}`),
                authFetch(`/api/dailyMemo?date=${dateStr}&userId=${userId}`)
            ]);

            if (!taskRes.ok || !memoRes.ok) throw new Error("일간 데이터를 불러오는 데 실패했습니다.");

            const tasks = await taskRes.json();
            const memoData = await memoRes.json();

            set({ tasks, memo: memoData.content, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            set({ error: message, isLoading: false, tasks: [], memo: "" });
            console.error("[DAILY_FETCH_ERROR]", err);
        }
    },

    addDailyTask: async (authFetch, date, text) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        const previousTasks = get().tasks;
        const tempId = `temp-${Date.now()}`;

        const newTask: DailyTaskType = {
            id: tempId,
            text,
            isDone: false,
            date: date.toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        try {
            const res = await authFetch('/api/dailyTask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, date: date.toISOString(), userId }),
            });

            if (res.ok) {
                const serverTask = await res.json();
                set((state) => ({
                    tasks: state.tasks.map(t => t.id === tempId ? serverTask : t)
                }));
            } else {
                throw new Error();
            }
        } catch (err) {
            set({ tasks: previousTasks });
            console.error("[DAILY_ADD_TASK_ERROR]", err);
        }
    },

    toggleDailyTask: async (authFetch, taskId) => {
        const previousTasks = get().tasks;
        const target = previousTasks.find(t => t.id === taskId);
        if (!target) return;

        const newStatus = !target.isDone;

        set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, isDone: newStatus } : t)
        }));

        try {
            const res = await authFetch('/api/dailyTask', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, isDone: newStatus }),
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ tasks: previousTasks });
            console.error("[DAILY_TOGGLE_TASK_ERROR]", err);
        }
    },

    deleteDailyTask: async (authFetch, taskId) => {
        const previousTasks = get().tasks;

        set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));

        try {
            const res = await authFetch(`/api/dailyTask?id=${taskId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ tasks: previousTasks });
            console.error("[DAILY_DELETE_TASK_ERROR]", err);
        }
    },

    updateDailyMemo: async (authFetch, date, content) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        const previousMemo = get().memo;

        set({ memo: content });

        try {
            const res = await authFetch('/api/dailyMemo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, date: date.toISOString(), userId }),
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ memo: previousMemo });
            console.error("[DAILY_UPDATE_MEMO_ERROR]", err);
        }
    }
}));

export default useDailyStore;