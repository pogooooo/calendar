import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        const whereClause = categoryId ? { categoryId } : {};

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                assignees: true,
                tasks: {
                    include: {
                        blockedBy: true,
                        assignees: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "프로젝트 데이터를 불러오는데 실패했습니다." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, categoryId, startAt, endAt, assignees } = body;

        if (!title || !categoryId) {
            return NextResponse.json({ error: "필수 항목 누락." }, { status: 400 });
        }

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                categoryId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                assignees: assignees && assignees.length > 0 ? {
                    connect: assignees.map((id: string) => ({ id }))
                } : undefined,
            },
            include: {
                assignees: true,
            }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "생성 실패" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, status, startAt, endAt, assignees } = body;

        if (!id) {
            return NextResponse.json({ error: "ID 누락" }, { status: 400 });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                status,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
                assignees: assignees ? {
                    set: assignees.map((userId: string) => ({ id: userId }))
                } : undefined,
            },
            include: {
                assignees: true,
                tasks: {
                    include: {
                        blockedBy: true,
                        assignees: true
                    }
                }
            }
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "수정 실패" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID 누락" }, { status: 400 });
        }

        await prisma.project.delete({
            where: { id }
        });

        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }
}