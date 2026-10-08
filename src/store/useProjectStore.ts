import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import { fx } from "@/lib/fx";
import type { AuthFetch, ProjectType, ProjectTaskType, UserType } from '@/types';

export type { ProjectType, ProjectTaskType, UserType };

interface ProjectState {
    projects: ProjectType[];
    isLoading: boolean;
    error: string | null;

    fetchProjects: (authFetch: AuthFetch, categoryId?: string) => Promise<void>;
    addProject: (authFetch: AuthFetch, data: Partial<ProjectType>) => Promise<string | null>;
    updateProject: (authFetch: AuthFetch, projectId: string, data: Partial<ProjectType>) => Promise<string | null>;
    deleteProject: (authFetch: AuthFetch, projectId: string) => Promise<void>;

    addProjectTask: (authFetch: AuthFetch, projectId: string, data: Partial<ProjectTaskType>) => Promise<string | null>;
    updateProjectTaskStatus: (authFetch: AuthFetch, projectId: string, taskId: string, newStatus: string) => Promise<void>;
    updateProjectTask: (authFetch: AuthFetch, projectId: string, taskId: string, data: Partial<ProjectTaskType>) => Promise<string | null>;
    deleteProjectTask: (authFetch: AuthFetch, projectId: string, taskId: string) => Promise<string | null>;
}

const isSessionExpired = (err: unknown) =>
    err instanceof Error && err.message === "Session expired";

async function requireSuccess(response: Response) {
    if (response.ok) return;
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "변경 내용을 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.");
}
const failureMessage = (error: unknown) => error instanceof Error && error.message ? error.message : "변경 내용을 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.";
/** 담당자는 화면(저장소)에선 사람으로 들고 서버에는 id 만 보낸다 — 예전엔 id 를 저장소에 그대로 넣어서,
    한 번 저장한 프로젝트를 다시 열면 담당자가 풀려 보이고 다시 저장하면 null 이 실려 실패했다 */
const toWire = <T extends { assignees?: unknown }>(data: T) => Array.isArray(data.assignees)
    ? { ...data, assignees: (data.assignees as (UserType | string)[]).map((a) => (typeof a === "string" ? a : a.id)) }
    : data;
/* 실패하면 그 일만 되돌린다. 예전엔 요청 직전의 목록 전체로 돌려서, 그사이 옮긴 다른 카드가 제자리로 튀거나
   (서버엔 저장됐는데) 먼저 실패한 요청의 변경이 다음 실패 때 되살아나 화면과 서버가 어긋났다 */
const mapTasks = (projects: ProjectType[], projectId: string, fn: (tasks: ProjectTaskType[]) => ProjectTaskType[]) =>
    projects.map(p => p.id === projectId ? { ...p, tasks: fn(p.tasks ?? []) } : p);
/** 보드 칸의 차례 — 옮긴 방향(효과)을 셀 때 */
const STATUS_ORDER = ["todo", "in_progress", "done"];

const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async (authFetch, categoryId) => {
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce(`project:${categoryId ?? ""}`, READ_TTL, async () => {
            set({ isLoading: true, error: null });
            try {
                let url = '/api/project';
                if (categoryId) url += `?${new URLSearchParams({ categoryId })}`;
    
                const res = await authFetch(url);
                if (res.status === 401) { set({ isLoading: false }); return; }
                if (!res.ok) throw new Error("프로젝트 데이터를 불러오는 데 실패했습니다.");
    
                const projects = await res.json();
                set({ projects, isLoading: false });
            } catch (err: unknown) {
                if (isSessionExpired(err)) { set({ isLoading: false }); return; }
                const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
                set({ error: message, isLoading: false });
                console.error("[PROJECT_FETCH_ERROR]", err);
            }
        });
    },

    addProject: async (authFetch, data) => {
        const tempId = `temp-proj-${Date.now()}`;
        const newProject: ProjectType = {
            id: tempId,
            title: data.title || "새 프로젝트",
            categoryId: data.categoryId || "",
            status: "todo",
            description: data.description ?? null,
            startAt: data.startAt ?? null,
            endAt: data.endAt ?? null,
            assignees: data.assignees ?? [],
            tasks: [],
        };

        set((state) => ({ projects: [newProject, ...state.projects] }));
        fx.emit("add");

        try {
            const res = await authFetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toWire(data)),
            });
            await requireSuccess(res);
            if (res.ok) {
                const serverProject = await res.json();
                set((state) => ({
                    projects: state.projects.map(p => p.id === tempId ? serverProject : p)
                }));
            } else {
                throw new Error();
            }
            return null;
        } catch (err) {
            set((state) => ({ projects: state.projects.filter(p => p.id !== tempId) }));
            console.error("[PROJECT_ADD_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    updateProject: async (authFetch, projectId, data) => {
        const before = get().projects.find(p => p.id === projectId);
        if (data.status === "done" && before?.status !== "done") fx.emit("project-done");
        set((state) => ({
            projects: state.projects.map(p => p.id === projectId ? { ...p, ...data } : p)
        }));

        try {
            const res = await authFetch('/api/project', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: projectId, ...toWire(data) }),
            });
            await requireSuccess(res);
            // 담당자는 서버가 고칠 수 있다(카테고리 멤버가 아니면 뺀다) — 보낸 것 말고 서버가 적은 것으로 맞춘다
            if (data.assignees) {
                const server = await res.json().catch(() => null) as ProjectType | null;
                if (server?.id === projectId && Array.isArray(server.assignees)) {
                    set((state) => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, assignees: server.assignees } : p) }));
                }
            }
            return null;
        } catch (err) {
            // 이 프로젝트의 칸만 되돌린다 (할 일 목록은 지금 것 그대로)
            if (before) set((state) => ({ projects: state.projects.map(p => p.id === projectId ? { ...before, tasks: p.tasks } : p) }));
            console.error("[PROJECT_UPDATE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    deleteProject: async (authFetch, projectId) => {
        const previousProjects = get().projects;
        set((state) => ({ projects: state.projects.filter(p => p.id !== projectId) }));
        fx.emit("remove");

        try {
            const res = await authFetch(`/api/project?id=${projectId}`, { method: 'DELETE' });
            await requireSuccess(res);
        } catch (err) {
            set({ projects: previousProjects });
            console.error("[PROJECT_DELETE_ERROR]", err);
            reportSaveFailure("project");
        }
    },

    addProjectTask: async (authFetch, projectId, data) => {
        const tempId = `temp-task-${Date.now()}`;

        const newTask: ProjectTaskType = {
            id: tempId,
            projectId,
            title: data.title || "새 할 일",
            description: data.description ?? null,
            status: data.status || "todo",
            priority: data.priority || "medium",
            // 달력이 서버 응답을 기다리지 않고 곧장 그리도록 날짜도 같이 둔다
            startAt: data.startAt ?? null,
            endAt: data.endAt ?? null,
            isAllDay: data.isAllDay ?? true,
            blockedBy: data.blockedBy ?? [],
            assignees: data.assignees ?? [],
        };

        set((state) => ({
            projects: state.projects.map(p =>
                p.id === projectId ? { ...p, tasks: [...(p.tasks ?? []), newTask] } : p
            )
        }));
        fx.emit("add");

        try {
            const res = await authFetch('/api/project/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...toWire(data), projectId }),
            });
            await requireSuccess(res);
            if (res.ok) {
                const serverTask = await res.json();
                set((state) => ({
                    projects: state.projects.map(p =>
                        p.id === projectId
                            ? { ...p, tasks: (p.tasks ?? []).map(t => t.id === tempId ? serverTask : t) }
                            : p
                    )
                }));
            } else throw new Error();
            return null;
        } catch (err) {
            set((state) => ({ projects: mapTasks(state.projects, projectId, tasks => tasks.filter(t => t.id !== tempId)) }));
            console.error("[PROJECT_TASK_ADD_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    updateProjectTaskStatus: async (authFetch, projectId, taskId, newStatus) => {
        const previousProjects = get().projects;
        // 끝냄이면 끝냄 — 그게 마지막 할 일이었으면 프로젝트 완료로. 그 밖에는 칸을 옮긴 쪽(끝 쪽 1, 되돌림 -1)
        const tasks = previousProjects.find(p => p.id === projectId)?.tasks ?? [];
        const before = tasks.find(t => t.id === taskId)?.status;
        const step = STATUS_ORDER.indexOf(newStatus) - STATUS_ORDER.indexOf(before ?? "");
        if (newStatus === "done" && before !== "done") fx.emit(before && tasks.every(t => t.id === taskId || t.status === "done") ? "project-done" : "complete");
        else if (before && step) fx.emit("advance", { direction: step > 0 ? 1 : -1 });
        set((state) => ({
            projects: state.projects.map(p =>
                p.id === projectId
                    ? { ...p, tasks: (p.tasks ?? []).map(t => t.id === taskId ? { ...t, status: newStatus } : t) }
                    : p
            )
        }));

        try {
            const res = await authFetch('/api/project/task', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, status: newStatus }),
            });
            await requireSuccess(res);
        } catch (err) {
            // 그사이 다시 옮겼으면(지금 칸이 이번 것이 아니면) 그대로 둔다
            set((state) => ({ projects: mapTasks(state.projects, projectId, ts => ts.map(t => t.id === taskId && t.status === newStatus && before ? { ...t, status: before } : t)) }));
            console.error("[PROJECT_TASK_STATUS_ERROR]", err);
            reportSaveFailure("project");
        }
    },

    updateProjectTask: async (authFetch, projectId, taskId, data) => {
        const prevTask = get().projects.find(p => p.id === projectId)?.tasks?.find(t => t.id === taskId);
        set((state) => ({
            projects: state.projects.map(p =>
                p.id === projectId
                    ? { ...p, tasks: (p.tasks ?? []).map(t => t.id === taskId ? { ...t, ...data } : t) }
                    : p
            )
        }));

        try {
            const res = await authFetch('/api/project/task', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, ...toWire(data) }),
            });
            await requireSuccess(res);
            const serverTask = await res.json();
            set((state) => ({
                projects: state.projects.map(p =>
                    p.id === projectId
                        ? { ...p, tasks: (p.tasks ?? []).map(t => t.id === taskId ? serverTask : t) }
                        : p
                )
            }));
            return null;
        } catch (err) {
            // 이번에 바꾼 칸만 그 전 값으로
            if (prevTask) {
                const restored = Object.fromEntries(Object.keys(data).map(k => [k, prevTask[k as keyof ProjectTaskType]])) as Partial<ProjectTaskType>;
                set((state) => ({ projects: mapTasks(state.projects, projectId, ts => ts.map(t => t.id === taskId ? { ...t, ...restored } : t)) }));
            }
            console.error("[PROJECT_TASK_UPDATE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    deleteProjectTask: async (authFetch, projectId, taskId) => {
        const prevTasks = get().projects.find(p => p.id === projectId)?.tasks ?? [];
        fx.emit("remove");
        // 이 할 일을 선행 조건으로 걸어 둔 다른 할 일에서도 같이 뗀다 (서버는 관계 표에서 지운다)
        set((state) => ({
            projects: state.projects.map(p =>
                p.id === projectId
                    ? {
                        ...p,
                        tasks: (p.tasks ?? [])
                            .filter(t => t.id !== taskId)
                            .map(t => t.blockedBy?.some(b => b.id === taskId) ? { ...t, blockedBy: t.blockedBy.filter(b => b.id !== taskId) } : t),
                    }
                    : p
            )
        }));

        try {
            const res = await authFetch(`/api/project/task?${new URLSearchParams({ id: taskId })}`, { method: 'DELETE' });
            await requireSuccess(res);
            return null;
        } catch (err) {
            // 지운 할 일과 그것을 선행 조건으로 걸어 둔 연결만 되살린다 (제자리에)
            const removed = prevTasks.find(t => t.id === taskId);
            if (removed) set((state) => ({
                projects: mapTasks(state.projects, projectId, ts => {
                    const linked = new Set(prevTasks.filter(t => t.blockedBy?.some(b => b.id === taskId)).map(t => t.id));
                    const next = ts.map(t => linked.has(t.id) && !t.blockedBy?.some(b => b.id === taskId) ? { ...t, blockedBy: [...(t.blockedBy ?? []), removed] } : t);
                    if (next.some(t => t.id === taskId)) return next;
                    next.splice(Math.min(prevTasks.indexOf(removed), next.length), 0, removed);
                    return next;
                }),
            }));
            console.error("[PROJECT_TASK_DELETE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    }
}));

export default useProjectStore;
