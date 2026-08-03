import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('userId');

        if (!dateParam || !userId) {
            return NextResponse.json({ message: "날짜 및 유저 정보가 필요합니다." }, { status: 400 });
        }

        const date = new Date(dateParam);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const memo = await prisma.dailyMemo.findUnique({
            where: {
                userId_date: {
                    userId: userId,
                    date: startOfDay,
                }
            }
        });

        return NextResponse.json({ content: memo?.content || "" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "조회 실패" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { content, date, userId } = body;

        if (!userId) {
            return NextResponse.json({ message: "권한 없음" }, { status: 401 });
        }

        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const savedMemo = await prisma.dailyMemo.upsert({
            where: {
                userId_date: {
                    userId: userId,
                    date: startOfDay,
                }
            },
            update: {
                content: content,
            },
            create: {
                userId: userId,
                date: startOfDay,
                content: content,
            }
        });

        return NextResponse.json(savedMemo, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "저장 실패" }, { status: 500 });
    }
}