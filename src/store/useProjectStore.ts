import { create } from 'zustand';
import type { AuthFetch, ProjectType, ProjectTaskType, UserType } from '@/types';

export type { ProjectType, ProjectTaskType, UserType };

interface ProjectState {
    projects: ProjectType[];
    isLoading: boolean;
    error: string | null;

    fetchProjects: (authFetch: AuthFetch, categoryId?: string) => Promise<void>;
    addProject: (authFetch: AuthFetch, data: Partial<ProjectType>) => Promise<void>;
    updateProject: (authFetch: AuthFetch, projectId: string, data: Partial<ProjectType>) => Promise<void>;
    deleteProject: (authFetch: AuthFetch, projectId: string) => Promise<void>;

    addProjectTask: (authFetch: AuthFetch, projectId: string, data: Partial<ProjectTaskType>) => Promise<void>;
    updateProjectTaskStatus: (authFetch: AuthFetch, projectId: string, taskId: string, newStatus: string) => Promise<void>;
    updateProjectTask: (authFetch: AuthFetch, projectId: string, taskId: string, data: Partial<ProjectTaskType>) => Promise<void>;
}

const isSessionExpired = (err: unknown) =>
    err instanceof Error && err.message === "Session expired";

const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async (authFetch, categoryId) => {
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
            if (res.status === 401) return;
            if (res.ok) {
                const serverProject = await res.json();
                set((state) => ({
                    projects: state.projects.map(p => p.id === tempId ? serverProject : p)
                }));
            } else {
                throw new Error();
            }
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_ADD_ERROR]", err);
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
            if (res.status === 401) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_UPDATE_ERROR]", err);
        }
    },

    deleteProject: async (authFetch, projectId) => {
        const previousProjects = get().projects;
        set((state) => ({ projects: state.projects.filter(p => p.id !== projectId) }));

        try {
            const res = await authFetch(`/api/project?id=${projectId}`, { method: 'DELETE' });
            if (res.status === 401) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_DELETE_ERROR]", err);
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
            if (res.status === 401) return;
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
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_ADD_ERROR]", err);
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
            if (res.status === 401) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_STATUS_ERROR]", err);
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
            if (res.status === 401) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            if (isSessionExpired(err)) return;
            set({ projects: previousProjects });
            console.error("[PROJECT_TASK_UPDATE_ERROR]", err);
        }
    }
}));

export default useProjectStore;
