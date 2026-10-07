"use client";

import * as React from "react";
import TaskModal from "./TaskModal";
import useProjectStore, { type ProjectTaskType } from "@/store/useProjectStore";
import useCategoryStore from "@/store/useCategoryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import type { UserType } from "@/types";

/** 어떤 할 일을 열지. taskId 가 없으면 그 프로젝트에 새로 만든다 */
export interface TaskEditTarget {
    projectId: string;
    taskId?: string;
    /** 새로 만들 때 미리 채울 값 (달력에서 고른 날짜·시각 등) */
    defaults?: Partial<ProjectTaskType>;
}

const EMPTY: Partial<ProjectTaskType> = {
    title: "", description: "", status: "todo", priority: "medium",
    startAt: null, endAt: null, isAllDay: true, blockedBy: [], assignees: [],
};

/**
 * 프로젝트 할 일 편집 창을 어디서든 띄운다 — 프로젝트 화면, 월간·주간·일간 달력.
 *
 * 예전에는 프로젝트 화면만 이 창을 들고 있어서, 달력에서 프로젝트 할 일을 누르면 "프로젝트 화면에서 고치세요"
 * 안내만 떴다. 저장·삭제·담당자 후보(카테고리 참가자)·선행 조건 후보(같은 프로젝트의 할 일)를 여기서 다 맡는다.
 */
export default function ProjectTaskEditor({ target, onClose }: { target: TaskEditTarget | null; onClose: () => void }) {
    const projects = useProjectStore((s) => s.projects);
    const addProjectTask = useProjectStore((s) => s.addProjectTask);
    const updateProjectTask = useProjectStore((s) => s.updateProjectTask);
    const deleteProjectTask = useProjectStore((s) => s.deleteProjectTask);
    const categories = useCategoryStore((s) => s.categories);
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();

    const [data, setDataState] = React.useState<Partial<ProjectTaskType>>(EMPTY);
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const pendingRef = React.useRef(false);

    const project = target ? projects.find((p) => p.id === target.projectId) : undefined;
    const tasks = project?.tasks ?? [];
    const availableAssignees = categories.find((c) => c.id === project?.categoryId)?.participants ?? [];

    // 열 때마다 새로 채운다. 저장 뒤 서버 값으로 바뀐 할 일을 다시 열어도 그 값으로
    React.useEffect(() => {
        if (!target) return;
        setError(null);
        const task = target.taskId
            ? useProjectStore.getState().projects.find((p) => p.id === target.projectId)?.tasks?.find((x) => x.id === target.taskId)
            : undefined;
        setDataState(task
            ? {
                id: task.id, title: task.title, description: task.description ?? "", status: task.status,
                priority: task.priority || "medium", startAt: task.startAt ?? null, endAt: task.endAt ?? null,
                isAllDay: task.isAllDay ?? true, blockedBy: task.blockedBy ?? [], assignees: task.assignees ?? [],
            }
            : { ...EMPTY, ...target.defaults });
    }, [target]);

    const setData = (d: Partial<ProjectTaskType>) => setDataState((prev) => ({ ...prev, ...d }));

    const close = () => { if (!pendingRef.current) onClose(); };

    const run = async (job: () => Promise<string | null>) => {
        pendingRef.current = true;
        setPending(true);
        setError(null);
        try {
            const err = await job();
            if (err) setError(err);
            else onClose();
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
    };

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target || pendingRef.current) return;
        if (data.startAt && data.endAt && new Date(data.endAt) < new Date(data.startAt)) {
            setError(t.interaction.invalidDates);
            return;
        }
        // 담당자는 id 로 보낸다 (서버가 연결만 한다)
        const payload = { ...data, assignees: data.assignees?.map((a) => a.id) as unknown as ProjectTaskType["assignees"] };
        await run(() => target.taskId
            ? updateProjectTask(authFetch, target.projectId, target.taskId, payload)
            : addProjectTask(authFetch, target.projectId, payload));
    };

    const onDelete = async () => {
        if (!target?.taskId || pendingRef.current) return;
        const ok = await dialog.confirmDanger({
            title: t.project.deleteTaskConfirm,
            message: t.project.deleteTaskMsg(data.title || ""),
        });
        if (!ok) return;
        await run(() => deleteProjectTask(authFetch, target.projectId, target.taskId!));
    };

    const toggleParticipant = (user: UserType) => {
        const on = data.assignees?.some((a) => a.id === user.id);
        setData({ assignees: on ? (data.assignees ?? []).filter((a) => a.id !== user.id) : [...(data.assignees ?? []), user] });
    };

    return (
        <TaskModal
            pending={pending}
            error={error}
            isOpen={!!target && !!project}
            mode={target?.taskId ? "edit" : "add"}
            data={data}
            tasks={tasks}
            availableAssignees={availableAssignees}
            onClose={close}
            onSave={onSave}
            onDelete={target?.taskId ? onDelete : undefined}
            setData={setData}
            toggleParticipant={toggleParticipant}
        />
    );
}
