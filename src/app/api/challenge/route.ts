import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 챌린지 조회
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        const whereClause = categoryId ? { categoryId } : {};

        const challenges = await prisma.challenge.findMany({
            where: whereClause,
            include: { completions: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(challenges);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// 챌린지 생성
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, startAt, interval, targetCount, categoryId } = body;

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description,
                startAt: new Date(startAt),
                interval: interval || 1,
                targetCount: targetCount || null,
                categoryId
            },
            include: { completions: true }
        });

        return NextResponse.json(challenge);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// 챌린지 수정
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;

        if (data.startAt) data.startAt = new Date(data.startAt);

        const challenge = await prisma.challenge.update({
            where: { id },
            data,
            include: { completions: true }
        });

        return NextResponse.json(challenge);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// 챌린지 삭제
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return new NextResponse("ID required", { status: 400 });

        await prisma.challenge.delete({ where: { id } });

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}