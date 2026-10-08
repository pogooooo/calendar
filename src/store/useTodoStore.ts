import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import type { AuthFetch, TodoType, TodoCompletionType } from '@/types';
import { toUtcAnchorIso, utcDayKey } from '@/lib/dateKey';
import { readError } from '@/lib/readError';
import { fx } from '@/lib/fx';

export type { TodoType, TodoCompletionType };

interface TodoState {
    todos: TodoType[];
    isLoading: boolean;
    error: string | null;

    fetchTodos: (authFetch: AuthFetch, params?: { start?: string; end?: string; categoryId?: string }) => Promise<void>;
    toggleTodo: (authFetch: AuthFetch, todoId: string, targetDate: string) => Promise<void>;
    addTodo: (authFetch: AuthFetch, data: Partial<TodoType>) => Promise<string | null>;
    updateTodo: (authFetch: AuthFetch, todoId: string, data: Partial<TodoType>) => Promise<string | null>;
    deleteTodo: (authFetch: AuthFetch, todoId: string) => Promise<string | null>;
    deleteTodoOccurrence: (authFetch: AuthFetch, todoId: string, dateKey: string) => Promise<void>;
}

type SetTodos = (fn: (state: TodoState) => Partial<TodoState>) => void;

/** 한 일정의 한 날 완료 여부만 바꾼다 (낙관적 갱신과 그 되돌리기) */
function setDone(set: SetTodos, todoId: string, dayKey: string, anchorIso: string, done: boolean) {
    set((state) => ({
        todos: state.todos.map(t => {
            if (t.id !== todoId) return t;
            const rest = (t.completions ?? []).filter(c => utcDayKey(c.targetDate) !== dayKey);
            return { ...t, completions: done ? [...rest, { targetDate: anchorIso }] : rest };
        })
    }));
}

/** 같은 일정·같은 날의 완료 요청 줄 — 차례로 보내고, 서버가 마지막으로 받아들인 상태를 기억한다 */
const toggleLines = new Map<string, { chain: Promise<void>; confirmed: boolean; seq: number }>();

const useTodoStore = create<TodoState>((set, get) => ({
    todos: [],
    isLoading: false,
    error: null,

    fetchTodos: async (authFetch, params) => {
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce(`todo:${JSON.stringify(params ?? {})}`, READ_TTL, async () => {
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
        });
    },

    toggleTodo: async (authFetch, todoId, targetDate) => {
        const target = get().todos.find(t => t.id === todoId);
        if (!target) return;

        // 호출부가 순간(instant)을 넘기든 날짜를 넘기든, 사용자의 시간대 기준 달력일로 통일한다.
        // 그러지 않으면 KST 오전 9시 이전 일정이 전날로 기록돼 체크가 유지되지 않는다.
        const anchorIso = toUtcAnchorIso(targetDate);
        const targetDateStr = anchorIso.slice(0, 10);

        const isCompleted = !!target.completions?.some(c =>
            utcDayKey(c.targetDate) === targetDateStr
        );

        setDone(set, todoId, targetDateStr, anchorIso, !isCompleted);
        if (!isCompleted) fx.emit("complete");

        // 바라는 상태를 보내므로 같은 일정·같은 날을 빠르게 두 번 누르면 두 요청이 뒤바뀌어 도착할 수 있다 —
        // 그러면 서버는 화면과 반대로 남는다. 앞 요청이 끝난 뒤에 보낸다
        const key = `${todoId}|${targetDateStr}`;
        let line = toggleLines.get(key);
        if (!line) { line = { chain: Promise.resolve(), confirmed: isCompleted, seq: 0 }; toggleLines.set(key, line); }
        const entry = line;
        const seq = ++entry.seq;
        const run = entry.chain.then(async () => {
            const res = await authFetch('/api/todo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // 뒤집기가 아니라 바라는 상태를 보낸다 — 다른 기기에서 이미 끝낸 것을 이 화면이 모른 채 눌러도 서버가 도로 풀지 않게
                body: JSON.stringify({ id: todoId, targetDate: anchorIso, completed: !isCompleted }),
            });
            // 401 도 실패다 — 토큰 갱신이 잠깐 실패하면 401 이 그대로 오는데, 예전엔 되돌리지 않아 저장 안 된 체크가 화면에 남았다
            if (!res.ok) throw new Error(`status ${res.status}`);
            entry.confirmed = !isCompleted;
        });
        entry.chain = run.catch(() => {});
        try {
            await run;
        } catch (err) {
            // 그 뒤에 또 누른 것이 있으면 그쪽 결과가 화면을 정한다. 마지막 것이 실패하면 서버가 마지막으로 받아들인 상태로 되돌린다
            // (예전엔 목록 전체를 누르기 전 것으로 되돌려, 그사이 받은 목록·다른 변경까지 옛것이 됐다)
            if (entry.seq === seq) setDone(set, todoId, targetDateStr, anchorIso, entry.confirmed);
            console.error("[TODO_TOGGLE_ERROR]", err);
            reportSaveFailure("todo");
        } finally {
            if (entry.seq === seq && toggleLines.get(key) === entry) toggleLines.delete(key);
        }
    },

    addTodo: async (authFetch, data) => {
        const tempId = `temp-${Date.now()}`;
        // 실패하면 이 임시 항목만 뺀다 — 목록 전체를 넣기 전 것으로 되돌리면 그사이 들어온 다른 변경까지 사라졌다
        const dropTemp = () => set((state) => ({ todos: state.todos.filter(t => t.id !== tempId) }));
        fx.emit("add");

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
            dropTemp();
            return body?.message ?? "할 일 등록에 실패했습니다.";
        } catch (err) {
            dropTemp();
            console.error("[TODO_ADD_ERROR]", err);
            reportSaveFailure("todo");
            return "할 일 등록 중 오류가 발생했습니다.";
        }
    },

    updateTodo: async (authFetch, todoId, data) => {
        const before = get().todos.find(t => t.id === todoId);
        // 실패하면 이 일정의 바꾼 칸만 되돌린다
        const revert = () => {
            if (!before) return;
            const old = Object.fromEntries(Object.keys(data).map(k => [k, before[k as keyof TodoType]])) as Partial<TodoType>;
            set((state) => ({ todos: state.todos.map(t => t.id === todoId ? { ...t, ...old } : t) }));
        };
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
            revert();
            return body?.message ?? "할 일 수정에 실패했습니다.";
        } catch (err) {
            revert();
            console.error("[TODO_UPDATE_ERROR]", err);
            reportSaveFailure("todo");
            return "할 일 수정 중 오류가 발생했습니다.";
        }
    },

    deleteTodo: async (authFetch, todoId) => {
        const index = get().todos.findIndex(t => t.id === todoId);
        const before = index >= 0 ? get().todos[index] : undefined;
        // 실패하면 이 일정만 제자리에 되살린다 (그사이 다시 받은 목록에 이미 있으면 그대로)
        const restore = () => {
            if (!before) return;
            set((state) => {
                if (state.todos.some(t => t.id === todoId)) return {};
                const todos = [...state.todos];
                todos.splice(Math.min(index, todos.length), 0, before);
                return { todos };
            });
        };
        set((state) => ({ todos: state.todos.filter(t => t.id !== todoId) }));
        fx.emit("remove");

        try {
            const res = await authFetch(`/api/todo?id=${todoId}`, { method: 'DELETE' });
            if (!res.ok) {
                restore();
                return await readError(res, "할 일을 삭제하지 못했습니다.");
            }
            return null;
        } catch (err) {
            restore();
            console.error("[TODO_DELETE_ERROR]", err);
            reportSaveFailure("todo");
            return "네트워크 오류로 할 일을 삭제하지 못했습니다.";
        }
    },

    deleteTodoOccurrence: async (authFetch, todoId, dateKey) => {
        const beforeExcluded = get().todos.find(t => t.id === todoId)?.excludedDates ?? null;
        fx.emit("remove");

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
            // 이 일정의 뺀 날만 되돌린다
            set((state) => ({ todos: state.todos.map(t => t.id === todoId ? { ...t, excludedDates: beforeExcluded } : t) }));
            console.error("[TODO_DELETE_OCCURRENCE_ERROR]", err);
            reportSaveFailure("todo");
        }
    }
}));

export default useTodoStore;
