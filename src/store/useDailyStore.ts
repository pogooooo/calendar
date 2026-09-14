import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import useAuthStore from '@/store/useAuthStore';
import type { AuthFetch, DailyTaskType } from '@/types';
import { localDateKey } from '@/lib/dateKey';

export type { DailyTaskType };

interface DailyState {
    tasks: DailyTaskType[];
    memo: string;
    /** memo 가 어느 날짜(YYYY-MM-DD) 것인지. 홈 위젯은 오늘 것일 때만 쓴다 */
    memoDate: string;
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
    memoDate: "",
    isLoading: false,
    error: null,
    memoError: null,

    fetchDailyData: async (authFetch, date) => {
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce(`daily:${localDateKey(date)}`, READ_TTL, async () => {
            const userId = useAuthStore.getState().user?.id;
            if (!userId) return;
    
            set({ isLoading: true, error: null });
            try {
                const dateStr = localDateKey(date);
                // 켤 때는 요청 여덟 개가 한꺼번에 나가 이 둘 중 하나가 간혹 떨어진다 (폰 앱에서 실제로 봤다).
                // 한 번은 다시 묻는다 — 안 그러면 오늘 메모가 홈 위젯에 안 실린 채로 남는다.
                const load = () => Promise.all([
                    authFetch(`/api/dailyTask?date=${dateStr}`),
                    authFetch(`/api/dailyMemo?date=${dateStr}`)
                ]);
                let [taskRes, memoRes] = await load().catch(() => [null, null] as const);
                if (!taskRes?.ok || !memoRes?.ok) {
                    await new Promise(r => setTimeout(r, 1500));
                    [taskRes, memoRes] = await load();
                }
    
                if (!taskRes.ok || !memoRes.ok) throw new Error("일간 데이터를 불러오는 데 실패했습니다.");
    
                const tasks = await taskRes.json();
                const memoData = await memoRes.json();
                set({ tasks, memo: memoData.content, memoDate: dateStr, isLoading: false });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
                set({ error: message, isLoading: false, tasks: [], memo: "" });
                console.error("[DAILY_FETCH_ERROR]", err);
            }
        });
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
                body: JSON.stringify({ text, date: localDateKey(date) }),
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
            reportSaveFailure("daily");
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
            reportSaveFailure("daily");
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
            reportSaveFailure("daily");
        }
    },

    updateDailyMemo: async (authFetch, date, content) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return "로그인이 필요합니다.";

        set({ memo: content, memoDate: localDateKey(date), memoError: null });

        try {
            const res = await authFetch('/api/dailyMemo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, date: localDateKey(date) }),
            });
            if (!res.ok) throw new Error();
            return null;
        } catch (err) {
            // 예전 내용으로 되돌리면 사용자가 방금 쓴 글이 눈앞에서 사라진다.
            // 입력한 내용은 그대로 두고 저장 실패만 알린다.
            console.error("[DAILY_UPDATE_MEMO_ERROR]", err);
            reportSaveFailure("daily");
            const message = "메모를 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.";
            set({ memoError: message });
            return message;
        }
    }
}));

export default useDailyStore;
