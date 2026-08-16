import { create } from 'zustand';
import useAuthStore from '@/store/useAuthStore';
import type { AuthFetch, DailyTaskType } from '@/types';

export type { DailyTaskType };

interface DailyState {
    tasks: DailyTaskType[];
    memo: string;
    isLoading: boolean;
    error: string | null;
    memoError: string | null;

    fetchDailyData: (authFetch: AuthFetch, date: Date) => Promise<void>;
    addDailyTask: (authFetch: AuthFetch, date: Date, text: string) => Promise<void>;
    toggleDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;
    deleteDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;
    updateDailyMemo: (authFetch: AuthFetch, date: Date, content: string) => Promise<string | null>;
}

const useDailyStore = create<DailyState>((set, get) => ({
    tasks: [],
    memo: "",
    isLoading: false,
    error: null,
    memoError: null,

    fetchDailyData: async (authFetch, date) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
            const dateStr = date.toISOString();
            const [taskRes, memoRes] = await Promise.all([
                authFetch(`/api/dailyTask?date=${dateStr}`),
                authFetch(`/api/dailyMemo?date=${dateStr}`)
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
        const newTask: DailyTaskType = { id: tempId, text, isDone: false, date: date.toISOString() };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        try {
            const res = await authFetch('/api/dailyTask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, date: date.toISOString() }),
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
        if (!userId) return "로그인이 필요합니다.";

        set({ memo: content, memoError: null });

        try {
            const res = await authFetch('/api/dailyMemo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, date: date.toISOString() }),
            });
            if (!res.ok) throw new Error();
            return null;
        } catch (err) {
            // 예전 내용으로 되돌리면 사용자가 방금 쓴 글이 눈앞에서 사라진다.
            // 입력한 내용은 그대로 두고 저장 실패만 알린다.
            console.error("[DAILY_UPDATE_MEMO_ERROR]", err);
            const message = "메모를 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.";
            set({ memoError: message });
            return message;
        }
    }
}));

export default useDailyStore;
