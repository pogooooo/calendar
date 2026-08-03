import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('userId');

        if (!dateParam || !userId) {
            return NextResponse.json({ message: "날짜 및 유저 정보가 필요합니다." }, { status: 400 });
        }

        const date = new Date(dateParam);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const tasks = await prisma.dailyTask.findMany({
            where: {
                userId: userId,
                date: startOfDay,
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "조회 실패" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, date, userId } = body;

        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const inputDate = new Date(date);
        const startOfDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

        const newTask = await prisma.dailyTask.create({
            data: {
                text,
                date: startOfDay,
                userId: userId,
            }
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "추가 실패" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, text, isDone } = body;

        const updatedTask = await prisma.dailyTask.update({
            where: { id },
            data: {
                ...(text !== undefined && { text }),
                ...(isDone !== undefined && { isDone }),
            }
        });

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "수정 실패" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        await prisma.dailyTask.delete({
            where: { id }
        });

        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "삭제 실패" }, { status: 500 });
    }
}