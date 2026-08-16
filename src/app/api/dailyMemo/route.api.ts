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
