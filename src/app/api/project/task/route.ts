import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

type UpdateTaskData = {
    status?: string;
    title?: string;
    description?: string;
    priority?: string;
    startAt?: Date | null;
    endAt?: Date | null;
    blockedBy?: { set: { id: string }[] };
    assignees?: { set: { id: string }[] };
};

export async function POST(request: Request) {
    try {
        const { title, description, status, priority, projectId, startAt, endAt, blockedBy, assignees } = await request.json();

        if (!title || !projectId) {
            return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
        }

        const task = await prisma.projectTask.create({
            data: {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                projectId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                blockedBy: blockedBy && blockedBy.length > 0 ? {
                    connect: blockedBy.map((b: { id: string }) => ({ id: b.id }))
                } : undefined,
                assignees: assignees && assignees.length > 0 ? {
                    connect: assignees.map((a: { id: string }) => ({ id: a.id }))
                } : undefined
            },
            include: { blockedBy: true, assignees: true }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "할 일 생성 실패" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, title, description, priority, startAt, endAt, blockedBy, assignees } = body;

        const updateData: UpdateTaskData = { status, title, description, priority };

        if (startAt !== undefined) updateData.startAt = startAt ? new Date(startAt) : null;
        if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null;

        if (blockedBy !== undefined) {
            updateData.blockedBy = {
                set: blockedBy.map((b: { id: string } | string) => ({
                    id: typeof b === 'string' ? b : b.id
                }))
            };
        }

        if (assignees !== undefined) {
            updateData.assignees = {
                set: assignees.map((a: { id: string } | string) => ({
                    id: typeof a === 'string' ? a : a.id
                }))
            };
        }

        const task = await prisma.projectTask.update({
            where: { id },
            data: updateData,
            include: { blockedBy: true, assignees: true }
        });

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "상태 변경 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: "삭제할 할 일의 ID가 누락되었습니다." }, { status: 400 });
        }
        await prisma.projectTask.delete({ where: { id } });
        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }
}