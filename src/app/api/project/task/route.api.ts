import { publicUserSelect } from "@/lib/publicUser";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { CreateProjectTaskSchema, UpdateProjectTaskSchema } from '@/lib/schema';
import { getUserId, categoryAccessWhere } from '@/lib/apiAuth';

const canAccessProject = async (projectId: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: { id: projectId, category: categoryAccessWhere(userId) },
        select: { id: true },
    });
    return !!project;
};

const canAccessTask = async (taskId: string, userId: string) => {
    const task = await prisma.projectTask.findFirst({
        where: { id: taskId, project: { category: categoryAccessWhere(userId) } },
        select: { id: true },
    });
    return !!task;
};

/** blockedBy 는 검증을 거치지 않은 원본 body 에서 오므로 형태와 접근 권한을 모두 확인한다 */
const normalizeBlockedBy = (raw: unknown): string[] | null => {
    if (raw === undefined) return null;
    if (!Array.isArray(raw)) return [];
    return raw
        .map((b) => (typeof b === "string" ? b : (b && typeof b === "object" && typeof (b as { id?: unknown }).id === "string" ? (b as { id: string }).id : null)))
        .filter((v): v is string => !!v);
};

const assertBlockedByAccessible = async (ids: string[], userId: string) => {
    if (ids.length === 0) return true;
    const count = await prisma.projectTask.count({
        where: { id: { in: ids }, project: { category: categoryAccessWhere(userId) } },
    });
    return count === new Set(ids).size;
};

/** 응답에 남의 태스크 전체가 실려 나가지 않도록 필요한 필드만 고른다 */
const blockedBySelect = { select: { id: true, title: true, status: true } } as const;

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const parsed = CreateProjectTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, status, priority, projectId, startAt, endAt, assignees } = parsed.data;

        if (!(await canAccessProject(projectId, userId))) {
            return NextResponse.json({ message: "프로젝트를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });
        }
        const blockedBy = normalizeBlockedBy(body.blockedBy) ?? [];
        if (!(await assertBlockedByAccessible(blockedBy, userId))) {
            return NextResponse.json({ message: "연결할 수 없는 항목이 포함돼 있습니다." }, { status: 403 });
        }

        const task = await prisma.projectTask.create({
            data: {
                title,
                description,
                status: status ?? 'todo',
                priority: priority ?? 'medium',
                projectId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                blockedBy: blockedBy.length > 0 ? {
                    connect: blockedBy.map((id) => ({ id }))
                } : undefined,
                assignees: assignees?.length ? {
                    connect: assignees.map((id) => ({ id }))
                } : undefined,
            },
            include: { blockedBy: blockedBySelect, assignees: { select: publicUserSelect } }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("[TASK_POST_ERROR]", error);
        return NextResponse.json({ message: "할 일 생성 실패" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const parsed = UpdateProjectTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, endAt, assignees, ...rest } = parsed.data;

        if (!(await canAccessTask(id, userId))) {
            return NextResponse.json({ message: "할 일을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
        }
        const blockedBy = normalizeBlockedBy(body.blockedBy);
        if (blockedBy && !(await assertBlockedByAccessible(blockedBy, userId))) {
            return NextResponse.json({ message: "연결할 수 없는 항목이 포함돼 있습니다." }, { status: 403 });
        }

        const task = await prisma.projectTask.update({
            where: { id },
            data: {
                ...rest,
                ...(startAt !== undefined ? { startAt: startAt ? new Date(startAt) : null } : {}),
                ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
                ...(blockedBy !== null ? {
                    blockedBy: { set: blockedBy.map((id) => ({ id })) }
                } : {}),
                ...(assignees !== undefined ? {
                    assignees: { set: assignees.map((id) => ({ id })) }
                } : {}),
            },
            include: { blockedBy: blockedBySelect, assignees: { select: publicUserSelect } }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_PATCH_ERROR]", error);
        return NextResponse.json({ message: "상태 변경 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });
        }
        if (!(await canAccessTask(id, userId))) {
            return NextResponse.json({ message: "할 일을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
        }
        await prisma.projectTask.delete({ where: { id } });
        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[TASK_DELETE_ERROR]", error);
        return NextResponse.json({ message: "삭제 실패" }, { status: 500 });
    }
}
