import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { CreateProjectTaskSchema, UpdateProjectTaskSchema } from '@/lib/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = CreateProjectTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, status, priority, projectId, startAt, endAt, assignees } = parsed.data;
        const blockedBy: { id: string }[] = body.blockedBy ?? [];

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
                    connect: blockedBy.map((b) => ({ id: b.id }))
                } : undefined,
                assignees: assignees?.length ? {
                    connect: assignees.map((id) => ({ id }))
                } : undefined,
            },
            include: { blockedBy: true, assignees: true }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("[TASK_POST_ERROR]", error);
        return NextResponse.json({ message: "할 일 생성 실패" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const parsed = UpdateProjectTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, endAt, assignees, ...rest } = parsed.data;
        const blockedBy: ({ id: string } | string)[] | undefined = body.blockedBy;

        const task = await prisma.projectTask.update({
            where: { id },
            data: {
                ...rest,
                ...(startAt !== undefined ? { startAt: startAt ? new Date(startAt) : null } : {}),
                ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
                ...(blockedBy !== undefined ? {
                    blockedBy: { set: blockedBy.map((b) => ({ id: typeof b === 'string' ? b : b.id })) }
                } : {}),
                ...(assignees !== undefined ? {
                    assignees: { set: assignees.map((id) => ({ id })) }
                } : {}),
            },
            include: { blockedBy: true, assignees: true }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_PATCH_ERROR]", error);
        return NextResponse.json({ message: "상태 변경 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });
        }
        await prisma.projectTask.delete({ where: { id } });
        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[TASK_DELETE_ERROR]", error);
        return NextResponse.json({ message: "삭제 실패" }, { status: 500 });
    }
}
