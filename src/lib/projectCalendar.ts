import type { ProjectType, TodoType } from "@/types";

/** 달력이 프로젝트·프로젝트 할 일을 일정처럼 그릴 때 덧붙는 표시 */
export interface ProjectCalendarItem extends TodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
    /** 상태가 'done' 인지. 일정의 완료 기록(completions)이 아니라 프로젝트·할 일의 상태에서 온다 */
    isDone?: boolean;
    /** 할 일이 속한 프로젝트 — 달력에서 바로 고치거나 끝낼 때 쓴다 */
    projectId?: string;
    originalData?: unknown;
}

export const PROJECT_ITEM_PREFIX = "project-";
export const TASK_ITEM_PREFIX = "proj-task-";

const iso = (v: string | number | Date) => new Date(v).toISOString();

/**
 * 프로젝트와 그 할 일을 달력 항목으로 바꾼다 — 월간·주간·일간·고른 날 목록·주간 띠가 모두 이걸 쓴다.
 *
 * 예전에는 화면마다 따로 바꿨다. 그래서 할 일은 늘 하루 종일로 그려지고(시각을 줘도),
 * 끝낸 할 일이 월간·일간에서는 안 끝난 것처럼 보였다(주간만 맞았다).
 * 날짜가 하나만 있으면 그날 하루짜리로 본다. 날짜가 없는 것(할 일 목록에만 있는 것)은 달력에 안 나온다.
 *
 * marked: 일정과 섞여 그려지는 판(월간·주간·일간)에서는 제목 앞에 표시를 붙여 구분한다.
 */
export function projectCalendarItems(
    projects: ProjectType[],
    opts: { categoryIds?: readonly string[] | null; marked?: boolean } = {},
): ProjectCalendarItem[] {
    const { categoryIds, marked = false } = opts;
    const items: ProjectCalendarItem[] = [];
    for (const proj of projects) {
        if (categoryIds && !categoryIds.includes(proj.categoryId)) continue;

        const pStart = proj.startAt ?? proj.endAt;
        const pEnd = proj.endAt ?? proj.startAt;
        if (pStart && pEnd) {
            items.push({
                id: `${PROJECT_ITEM_PREFIX}${proj.id}`,
                title: marked ? `[Project] ${proj.title}` : proj.title,
                categoryId: proj.categoryId,
                startAt: iso(pStart),
                endAt: iso(pEnd),
                isAllDay: true,
                repeat: 0,
                memo: proj.description ?? null,
                completions: [],
                isProject: true,
                isDone: proj.status === "done",
                projectId: proj.id,
                originalData: proj,
            });
        }

        for (const task of proj.tasks ?? []) {
            const start = task.startAt ?? task.endAt;
            const end = task.endAt ?? task.startAt;
            if (!start || !end) continue;
            items.push({
                id: `${TASK_ITEM_PREFIX}${task.id}`,
                title: marked ? `↳ ${task.title}` : task.title,
                categoryId: proj.categoryId,
                startAt: iso(start),
                endAt: iso(end),
                isAllDay: task.isAllDay ?? true,
                repeat: 0,
                memo: task.description ?? null,
                completions: [],
                isProjectTask: true,
                isDone: task.status === "done",
                projectId: proj.id,
                originalData: task,
            });
        }
    }
    return items;
}

/** 달력 항목 id → 프로젝트 할 일 id (프로젝트 할 일이 아니면 null) */
export function taskIdOfItem(id: string): string | null {
    return id.startsWith(TASK_ITEM_PREFIX) ? id.slice(TASK_ITEM_PREFIX.length) : null;
}

/** 달력 항목 id → 프로젝트 id (프로젝트가 아니면 null) */
export function projectIdOfItem(id: string): string | null {
    return id.startsWith(PROJECT_ITEM_PREFIX) ? id.slice(PROJECT_ITEM_PREFIX.length) : null;
}
