import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { challengeId, targetDate } = body;

        const dateObj = new Date(targetDate);
        dateObj.setUTCHours(0, 0, 0, 0);

        const existingCompletion = await prisma.challengeCompletion.findFirst({
            where: {
                challengeId,
                targetDate: dateObj,
            }
        });

        if (existingCompletion) {
            await prisma.challengeCompletion.delete({
                where: { id: existingCompletion.id }
            });
        } else {
            await prisma.challengeCompletion.create({
                data: {
                    challengeId,
                    targetDate: dateObj,
                }
            });
        }

        const updatedCompletions = await prisma.challengeCompletion.findMany({
            where: { challengeId }
        });

        return NextResponse.json(updatedCompletions);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}