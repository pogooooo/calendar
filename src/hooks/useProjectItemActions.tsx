"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import useProjectStore from "@/store/useProjectStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import ProjectTaskEditor, { type TaskEditTarget } from "@/components/modal/projectModal/ProjectTaskEditor";
import { projectIdOfItem, taskIdOfItem, type ProjectCalendarItem } from "@/lib/projectCalendar";
import type { ProjectTaskType } from "@/types";

/** 달력이 들고 있는 항목 꼴 — 펼친 뒤에도 프로젝트 표시(projectId·isDone·originalData)는 그대로 따라온다 */
type Item = Pick<ProjectCalendarItem, "id" | "title" | "isDone" | "projectId" | "originalData">;

/**
 * 달력(월간·주간·일간)에 선 프로젝트·프로젝트 할 일을 그 자리에서 다루는 동작들.
 *
 * 예전에는 무엇을 하든 "프로젝트 화면에서 하세요" 안내만 떴다. 이제
 *   - 누르면: 할 일은 편집 창(시간·상태·담당자·선행 조건·삭제), 프로젝트는 그 프로젝트 화면
 *   - 완료 표시: 할 일·프로젝트의 상태를 끝냄 ↔ 되돌림
 *   - 삭제: 할 일만 (프로젝트 통째 삭제는 프로젝트 화면에서 — 달력에서 실수로 지우기엔 크다)
 *   - 끌어 옮기기·늘리기: 날짜를 바꿔 저장
 * editor 는 화면 어딘가에 한 번 그려 둔다 (편집 창).
 */
export function useProjectItemActions() {
    const router = useRouter();
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const [target, setTarget] = React.useState<TaskEditTarget | null>(null);

    const idsOf = (item: Item) => ({
        projectId: item.projectId ?? projectIdOfItem(item.id) ?? undefined,
        taskId: taskIdOfItem(item.id),
    });
    const titleOf = (item: Item) => (item.originalData as { title?: string } | undefined)?.title ?? item.title;

    const open = (item: Item) => {
        const { projectId, taskId } = idsOf(item);
        if (!projectId) return;
        if (taskId) setTarget({ projectId, taskId });
        else router.push(`/project?id=${encodeURIComponent(projectId)}`);
    };

    const toggle = async (item: Item) => {
        const { projectId, taskId } = idsOf(item);
        if (!projectId) return;
        const store = useProjectStore.getState();
        if (taskId) await store.updateProjectTaskStatus(authFetch, projectId, taskId, item.isDone ? "todo" : "done");
        else {
            const error = await store.updateProject(authFetch, projectId, { status: item.isDone ? "todo" : "done" });
            if (error) await dialog.notify({ title: t.alert.saveFailed, message: error });
        }
    };

    const remove = async (item: Item) => {
        const { projectId, taskId } = idsOf(item);
        if (!projectId) return;
        if (!taskId) {
            await dialog.notify({ title: t.alert.deleteHereTitle, message: t.alert.deleteHereDetailMsg });
            return;
        }
        const ok = await dialog.confirmDanger({ title: t.project.deleteTaskConfirm, message: t.project.deleteTaskMsg(titleOf(item)) });
        if (!ok) return;
        const error = await useProjectStore.getState().deleteProjectTask(authFetch, projectId, taskId);
        if (error) await dialog.notify({ title: t.alert.deleteFailed, message: error });
    };

    /** 날짜를 바꿔 저장한다. 되돌릴 때 쓰라고 원래 값(할 일·프로젝트에 실제로 들어 있던 것)도 같이 준다 */
    const reschedule = async (item: Item, startAt: string | null, endAt: string | null) => {
        const { projectId, taskId } = idsOf(item);
        const raw = item.originalData as { startAt?: string | null; endAt?: string | null } | undefined;
        const before = { startAt: raw?.startAt ?? null, endAt: raw?.endAt ?? null };
        if (!projectId) return { error: null as string | null, before };
        const store = useProjectStore.getState();
        const error = taskId
            ? await store.updateProjectTask(authFetch, projectId, taskId, { startAt, endAt })
            : await store.updateProject(authFetch, projectId, { startAt, endAt });
        return { error, before };
    };

    /** 그 프로젝트에 새 할 일 (달력에서 고른 날짜·시각을 미리 채워) */
    const createTask = (projectId: string, defaults?: Partial<ProjectTaskType>) => setTarget({ projectId, defaults });

    const editor = <ProjectTaskEditor target={target} onClose={() => setTarget(null)} />;

    return { open, toggle, remove, reschedule, createTask, editor };
}
