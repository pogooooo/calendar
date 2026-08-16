import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/apiAuth';

/**
 * 클라이언트는 반드시 사용자의 시간대로 계산한 날짜 키를 보낸다.
 * 순간(instant)을 받아 서버에서 달력일을 계산하면 런타임 시간대(UTC)에 좌우돼
 * 같은 날인데도 오전/오후에 서로 다른 레코드가 만들어진다.
 */
function dayStart(input: unknown): Date | null {
    if (typeof input !== "string") return null;
    const key = input.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const d = new Date(`${key}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
    try {
        // 사용자는 반드시 토큰에서 얻는다. 클라이언트가 보낸 userId 는 신뢰하지 않는다.
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startOfDay = dayStart(searchParams.get('date'));
        if (!startOfDay) {
            return NextResponse.json({ message: "날짜 정보가 필요합니다." }, { status: 400 });
        }

        const tasks = await prisma.dailyTask.findMany({
            where: { userId, date: startOfDay },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error("[DAILYTASK_GET_ERROR]", error);
        return NextResponse.json({ message: "조회 실패" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const body = await req.json();
        const { text, date } = body;

        if (typeof text !== "string" || !text.trim() || text.length > 500) {
            return NextResponse.json({ message: "내용이 올바르지 않습니다." }, { status: 400 });
        }

        const startOfDay = dayStart(date);
        if (!startOfDay) {
            return NextResponse.json({ message: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
        }

        const newTask = await prisma.dailyTask.create({
            data: { text: text.trim(), date: startOfDay, userId }
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("[DAILYTASK_POST_ERROR]", error);
        return NextResponse.json({ message: "추가 실패" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const body = await req.json();
        const { id, text, isDone } = body;

        if (typeof id !== "string" || !id) {
            return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });
        }
        if (text !== undefined && (typeof text !== "string" || text.length > 500)) {
            return NextResponse.json({ message: "내용이 올바르지 않습니다." }, { status: 400 });
        }
        if (isDone !== undefined && typeof isDone !== "boolean") {
            return NextResponse.json({ message: "완료 값이 올바르지 않습니다." }, { status: 400 });
        }

        // userId 를 조건에 포함해야 남의 항목을 수정할 수 없다
        const result = await prisma.dailyTask.updateMany({
            where: { id, userId },
            data: {
                ...(text !== undefined && { text }),
                ...(isDone !== undefined && { isDone }),
            }
        });

        if (result.count === 0) {
            return NextResponse.json({ message: "대상을 찾을 수 없습니다." }, { status: 404 });
        }

        const updatedTask = await prisma.dailyTask.findFirst({ where: { id, userId } });
        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error("[DAILYTASK_PATCH_ERROR]", error);
        return NextResponse.json({ message: "수정 실패" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const result = await prisma.dailyTask.deleteMany({ where: { id, userId } });

        if (result.count === 0) {
            return NextResponse.json({ message: "대상을 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        console.error("[DAILYTASK_DELETE_ERROR]", error);
        return NextResponse.json({ message: "삭제 실패" }, { status: 500 });
    }
}
