import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateChallengeSchema, UpdateChallengeSchema } from '@/lib/schema';
import { getUserId, categoryAccessWhere, checkCategoryPermission } from '@/lib/apiAuth';

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        const challenges = await prisma.challenge.findMany({
            where: {
                category: categoryAccessWhere(userId),
                ...(categoryId ? { categoryId } : {}),
            },
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
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await req.json();
        const parsed = CreateChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, startAt, interval, targetCount, categoryId } = parsed.data;

        const hasPermission = await checkCategoryPermission(categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });

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
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await req.json();
        const parsed = UpdateChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, ...rest } = parsed.data;

        const owned = await prisma.challenge.findFirst({
            where: { id, category: categoryAccessWhere(userId) },
            select: { id: true },
        });
        if (!owned) return NextResponse.json({ message: "챌린지를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

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
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const owned = await prisma.challenge.findFirst({
            where: { id, category: categoryAccessWhere(userId) },
            select: { id: true },
        });
        if (!owned) return NextResponse.json({ message: "챌린지를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        await prisma.challenge.delete({ where: { id } });

        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[CHALLENGE_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
