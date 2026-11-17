import { NextResponse } from 'next/server';
import prisma, { isUniqueViolation } from '@/lib/prisma';
import { ToggleChallengeSchema } from '@/lib/schema';
import { getUserId, categoryAccessWhere } from '@/lib/apiAuth';
import { readJson, badJson } from "@/lib/readJson";

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await readJson(req);
        if (body === undefined) return badJson();
        const parsed = ToggleChallengeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { challengeId, targetDate, done } = parsed.data;

        const owned = await prisma.challenge.findFirst({
            where: { id: challengeId, category: categoryAccessWhere(userId) },
            select: { id: true },
        });
        if (!owned) return NextResponse.json({ message: "챌린지를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        const dateObj = new Date(targetDate);
        dateObj.setUTCHours(0, 0, 0, 0);

        // Legacy SQLite records can store dates as integer timestamps while D1 uses text.
        // Match the UTC calendar day after Prisma has decoded either representation.
        const completions = await prisma.challengeCompletion.findMany({ where: { challengeId } });
        const dayKey = dateObj.toISOString().slice(0, 10);
        const existingCompletions = completions.filter(completion =>
            completion.targetDate.toISOString().slice(0, 10) === dayKey
        );
        const existingCompletion = existingCompletions[0];

        // 바라는 상태(done)가 오면 그대로 둔다 — 없으면(옛 앱) 뒤집는다. 겹친 요청은 500 대신 이미 그 상태로 본다
        if (!(done ?? !existingCompletion)) {
            if (existingCompletions.length) {
                await prisma.challengeCompletion.deleteMany({
                    where: { challengeId, id: { in: existingCompletions.map(completion => completion.id) } },
                });
            }
        } else if (!existingCompletion) {
            try {
                await prisma.challengeCompletion.create({
                    data: { challengeId, targetDate: dateObj }
                });
            } catch (e) {
                if (!isUniqueViolation(e)) throw e;
            }
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
