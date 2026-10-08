import { create } from 'zustand';
import { bustFetchCache, coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import { fx } from "@/lib/fx";
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

    /** date 를 주면 그 날을 화면에 올린다(일간·위젯 패널). 안 주면 배경 다시 읽기 — 화면이 보고 있는 날, 없으면 오늘 */
    fetchDailyData: (authFetch: AuthFetch, date?: Date) => Promise<void>;
    addDailyTask: (authFetch: AuthFetch, date: Date, text: string) => Promise<string | null>;
    toggleDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;
    deleteDailyTask: (authFetch: AuthFetch, taskId: string) => Promise<void>;
    updateDailyMemo: (authFetch: AuthFetch, date: Date, content: string) => Promise<string | null>;
}

/**
 * 화면(일간·위젯 패널)이 마지막으로 고른 날과 그때의 경로. 그 화면에 있는 동안은 그 날의 응답만 스토어에 올린다.
 * 예전에는 늦게 온 응답이 이겼다 — 일간이 10/5 를 여는 사이 켤 때 읽은 오늘 것이 늦게 오거나,
 * 토큰 갱신·위젯의 메모 저장으로 본 창이 "오늘" 을 다시 읽으면, 10/5 머리 밑에 오늘 메모·할 일이 떴고
 * 거기서 메모를 고치면 오늘 메모가 10/5 에 저장됐다.
 * 경로를 같이 적는 까닭: 일간을 떠나면 배경 다시 읽기는 다시 오늘을 읽어야 한다 (폰 홈 위젯의 오늘 메모).
 */
let viewed: { date: Date; path: string } | null = null;
const here = () => (typeof window === "undefined" ? "" : window.location.pathname);
const dayInView = (): Date | null => (viewed && viewed.path === here() ? viewed.date : null);

const useDailyStore = create<DailyState>((set, get) => ({
    tasks: [],
    memo: "",
    memoDate: "",
    isLoading: false,
    error: null,
    memoError: null,

    fetchDailyData: async (authFetch, date) => {
        if (date) viewed = { date, path: here() };
        const target = date ?? dayInView() ?? new Date();
        const dateStr = localDateKey(target);
        // 방금 읽은 날이라도 지금 들고 있는 날이 아니면 다시 읽는다 (다른 날을 들렀다 1.5초 안에 돌아오면 그 날 것이 남아 있었다)
        if (get().memoDate !== dateStr) bustFetchCache(`daily:${dateStr}`);
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce(`daily:${dateStr}`, READ_TTL, async () => {
            const userId = useAuthStore.getState().user?.id;
            if (!userId) return;
            // 그사이 화면이 다른 날을 골랐으면 이 응답은 버린다
            const stale = () => { const v = dayInView(); return !!v && localDateKey(v) !== dateStr; };

            set({ isLoading: true, error: null });
            try {
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
                if (stale()) return;
                set({ tasks, memo: memoData.content, memoDate: dateStr, isLoading: false });
            } catch (err: unknown) {
                if (stale()) return;
                // 망이 끊기면 err.message 가 'Failed to fetch' 라 그대로 보여 주지 않는다
                const message = "일간 데이터를 불러오지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.";
                set({ error: message, isLoading: false, tasks: [], memo: "" });
                console.error("[DAILY_FETCH_ERROR]", err);
            }
        });
    },

    addDailyTask: async (authFetch, date, text) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return "로그인이 필요합니다.";

        const previousTasks = get().tasks;
        const tempId = `temp-${Date.now()}`;
        const newTask: DailyTaskType = { id: tempId, text, isDone: false, date: date.toISOString() };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        fx.emit("add");

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
                return null;
            } else {
                throw new Error();
            }
        } catch (err) {
            set({ tasks: previousTasks });
            console.error("[DAILY_ADD_TASK_ERROR]", err);
            reportSaveFailure("daily");
            return "할 일을 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.";
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
        if (newStatus) fx.emit("complete");

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
        fx.emit("remove");

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
