import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
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
        const previousProjects = get().projects;
        const tempId = `temp-proj-${Date.now()}`;
        const newProject: ProjectType = {
            id: tempId,
            title: data.title || "새 프로젝트",
            categoryId: data.categoryId || "",
            status: "todo",
            description: data.description ?? null,
            startAt: data.startAt ?? null,
            endAt: data.endAt ?? null,
            assignees: [],
            tasks: [],
        };

        set((state) => ({ projects: [newProject, ...state.projects] }));

        try {
            const res = await authFetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
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
            set({ projects: previousProjects });
            console.error("[PROJECT_ADD_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    updateProject: async (authFetch, projectId, data) => {
        const previousProjects = get().projects;
        set((state) => ({
            projects: state.projects.map(p => p.id === projectId ? { ...p, ...data } : p)
        }));

        try {
            const res = await authFetch('/api/project', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: projectId, ...data }),
            });
            await requireSuccess(res);
            return null;
        } catch (err) {
            set({ projects: previousProjects });
            console.error("[PROJECT_UPDATE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    deleteProject: async (authFetch, projectId) => {
        const previousProjects = get().projects;
        set((state) => ({ projects: state.projects.filter(p => p.id !== projectId) }));

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
        const previousProjects = get().projects;
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
        };

        set((state) => ({
            projects: state.projects.map(p =>
                p.id === projectId ? { ...p, tasks: [...(p.tasks ?? []), newTask] } : p
            )
        }));

        try {
            const res = await authFetch('/api/project/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, projectId }),
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
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_ADD_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    updateProjectTaskStatus: async (authFetch, projectId, taskId, newStatus) => {
        const previousProjects = get().projects;
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
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_STATUS_ERROR]", err);
            reportSaveFailure("project");
        }
    },

    updateProjectTask: async (authFetch, projectId, taskId, data) => {
        const previousProjects = get().projects;
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
                body: JSON.stringify({ id: taskId, ...data }),
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
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_UPDATE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    },

    deleteProjectTask: async (authFetch, projectId, taskId) => {
        const previousProjects = get().projects;
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
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_DELETE_ERROR]", err);
            reportSaveFailure("project");
            return failureMessage(err);
        }
    }
}));

export default useProjectStore;
