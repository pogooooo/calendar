import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ToggleChallengeSchema } from '@/lib/schema';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = ToggleChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { challengeId, targetDate } = parsed.data;

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
