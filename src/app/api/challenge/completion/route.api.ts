import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ToggleChallengeSchema } from '@/lib/schema';
import { getUserId, categoryAccessWhere } from '@/lib/apiAuth';

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await req.json();
        const parsed = ToggleChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { challengeId, targetDate } = parsed.data;

        const owned = await prisma.challenge.findFirst({
            where: { id: challengeId, category: categoryAccessWhere(userId) },
            select: { id: true },
        });
        if (!owned) return NextResponse.json({ message: "챌린지를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        const dateObj = new Date(targetDate);
        dateObj.setUTCHours(0, 0, 0, 0);

        const existingCompletion = await prisma.challengeCompletion.findFirst({
            where: { challengeId, targetDate: dateObj }
        });

        if (existingCompletion) {
            await prisma.challengeCompletion.delete({ where: { id: existingCompletion.id } });
        } else {
            await prisma.challengeCompletion.create({
                data: { challengeId, targetDate: dateObj }
            });
        }

        const updatedCompletions = await prisma.challengeCompletion.findMany({
            where: { challengeId }
        });

        return NextResponse.json(updatedCompletions);
    } catch (error) {
        console.error("[CHALLENGE_COMPLETION_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
