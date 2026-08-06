import { publicUserSelect } from "@/lib/publicUser";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { CreateProjectSchema, UpdateProjectSchema } from '@/lib/schema';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        const projects = await prisma.project.findMany({
            where: categoryId ? { categoryId } : {},
            include: {
                assignees: { select: publicUserSelect },
                tasks: {
                    include: {
                        blockedBy: true,
                        assignees: { select: publicUserSelect },
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("[PROJECT_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = CreateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, categoryId, startAt, endAt, assignees } = parsed.data;

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                categoryId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                assignees: assignees?.length ? {
                    connect: assignees.map((id) => ({ id }))
                } : undefined,
            },
            include: { assignees: { select: publicUserSelect } }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("[PROJECT_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const parsed = UpdateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, endAt, assignees, ...rest } = parsed.data;

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...rest,
                ...(startAt !== undefined ? { startAt: startAt ? new Date(startAt) : null } : {}),
                ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
                ...(assignees ? { assignees: { set: assignees.map((uid) => ({ id: uid })) } } : {}),
            },
            include: {
                assignees: { select: publicUserSelect },
                tasks: {
                    include: { blockedBy: true, assignees: { select: publicUserSelect } }
                }
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("[PROJECT_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        await prisma.project.delete({ where: { id } });

        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[PROJECT_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
