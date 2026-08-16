import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/apiAuth';

/**
 * 저장된 기존 레코드와 키가 어긋나면 안 되므로 날짜 계산 방식은 기존과 동일하게 유지한다.
 * (시간대 정규화는 별도 마이그레이션이 필요한 사안)
 */
function dayStart(input: unknown): Date | null {
    if (typeof input !== "string" && typeof input !== "number") return null;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
