import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateChallengeSchema, UpdateChallengeSchema } from '@/lib/schema';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        const challenges = await prisma.challenge.findMany({
            where: categoryId ? { categoryId } : {},
            include: { completions: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(challenges);
    } catch (error) {
        console.error("[CHALLENGE_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = CreateChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, startAt, interval, targetCount, categoryId } = parsed.data;

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description,
                startAt: new Date(startAt),
                interval: interval ?? 1,
                targetCount: targetCount ?? null,
                categoryId,
            },
            include: { completions: true }
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error("[CHALLENGE_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const parsed = UpdateChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, ...rest } = parsed.data;

        const challenge = await prisma.challenge.update({
            where: { id },
            data: {
                ...rest,
                ...(startAt ? { startAt: new Date(startAt) } : {}),
            },
            include: { completions: true }
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error("[CHALLENGE_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        await prisma.challenge.delete({ where: { id } });

        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[CHALLENGE_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
