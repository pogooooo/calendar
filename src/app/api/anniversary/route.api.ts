import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateAnniversarySchema, UpdateAnniversarySchema } from '@/lib/schema';
import { getUserId } from '@/lib/apiAuth';

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const anniversaries = await prisma.anniversary.findMany({
            where: { userId },
            orderBy: [{ month: 'asc' }, { day: 'asc' }],
        });

        return NextResponse.json(anniversaries);
    } catch (error) {
        console.error("[ANNIVERSARY_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await req.json();
        const parsed = CreateAnniversarySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, month, day, icon } = parsed.data;

        const anniversary = await prisma.anniversary.create({
            data: { title, month, day, icon: icon ?? null, userId },
        });

        return NextResponse.json(anniversary, { status: 201 });
    } catch (error) {
        console.error("[ANNIVERSARY_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await req.json();
        const parsed = UpdateAnniversarySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, ...data } = parsed.data;

        const owned = await prisma.anniversary.findFirst({ where: { id, userId }, select: { id: true } });
        if (!owned) return NextResponse.json({ message: "기념일을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        const anniversary = await prisma.anniversary.update({ where: { id }, data });

        return NextResponse.json(anniversary);
    } catch (error) {
        console.error("[ANNIVERSARY_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const owned = await prisma.anniversary.findFirst({ where: { id, userId }, select: { id: true } });
        if (!owned) return NextResponse.json({ message: "기념일을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        await prisma.anniversary.delete({ where: { id } });

        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[ANNIVERSARY_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
