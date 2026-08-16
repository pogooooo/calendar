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

        const memo = await prisma.dailyMemo.findUnique({
            where: {
                userId_date: { userId, date: startOfDay }
            }
        });

        return NextResponse.json({ content: memo?.content || "" }, { status: 200 });
    } catch (error) {
        console.error("[dailyMemo GET]", error);
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
        const { content, date } = body;

        if (typeof content !== "string" || content.length > 20000) {
            return NextResponse.json({ message: "메모 내용이 올바르지 않습니다." }, { status: 400 });
        }

        const startOfDay = dayStart(date);
        if (!startOfDay) {
            return NextResponse.json({ message: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
        }

        const savedMemo = await prisma.dailyMemo.upsert({
            where: {
                userId_date: { userId, date: startOfDay }
            },
            update: { content },
            create: { userId, date: startOfDay, content }
        });

        return NextResponse.json(savedMemo, { status: 200 });
    } catch (error) {
        console.error("[dailyMemo POST]", error);
        return NextResponse.json({ message: "저장 실패" }, { status: 500 });
    }
}
