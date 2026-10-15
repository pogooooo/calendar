import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/apiAuth";
import { normalizeEmail } from "@/lib/userEmail";
import { purgeExpiredInvites } from "@/lib/categoryInvite";
import { readJson, badJson } from "@/lib/readJson";

/**
 * 카테고리 초대 — 받는 쪽(목록·수락·거절)과 건 쪽(거두기). 초대를 거는 것은 /api/category PATCH(addParticipantEmail).
 * 받는 사람은 인증된 자기 주소로 온 초대만 본다 — 인증 안 된 계정은 로그인할 수 없으므로 남의 주소로 먼저 가입해 둔 사람이
 * 그 주소로 온 초대를 가로챌 수 없다(src/lib/emailVerification.ts).
 */

async function myEmail(userId: string): Promise<string | null> {
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });
    return me?.email && me.emailVerified ? normalizeEmail(me.email) : null;
}

/** 나에게 온, 아직 끝나지 않은 초대 */
export const GET = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        await purgeExpiredInvites();
        const email = await myEmail(userId);
        if (!email) return NextResponse.json([]);

        const invites = await prisma.categoryInvite.findMany({
            where: { email },
            orderBy: { createdAt: "asc" },
            select: { id: true, createdAt: true, inviterId: true, category: { select: { id: true, name: true, color: true, creatorName: true } } },
        });
        return NextResponse.json(invites.map((inv) => ({
            id: inv.id,
            categoryId: inv.category.id,
            categoryName: inv.category.name,
            color: inv.category.color,
            // 초대는 만든 사람만 걸 수 있다 — 그 이름(카테고리에 적힌 만든 이)
            inviterName: inv.category.creatorName,
            createdAt: inv.createdAt,
        })));
    } catch (error) {
        console.error("[CATEGORY_INVITE_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

/** 수락·거절 — { id, action: "accept" | "decline" } */
export const POST = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        const body = await readJson(request);
        if (body === undefined) return badJson();
        const { id, action } = body as { id?: unknown; action?: unknown };
        if (typeof id !== "string" || (action !== "accept" && action !== "decline")) {
            return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
        }

        const email = await myEmail(userId);
        const invite = await prisma.categoryInvite.findUnique({ where: { id }, select: { id: true, email: true, categoryId: true, expiresAt: true } });
        // 남의 초대는 없는 것처럼
        if (!invite || !email || invite.email !== email || invite.expiresAt < new Date()) {
            return NextResponse.json({ message: "초대를 찾을 수 없습니다. 이미 끝났거나 거두어졌습니다." }, { status: 404 });
        }

        if (action === "accept") {
            await prisma.$transaction([
                prisma.category.update({ where: { id: invite.categoryId }, data: { participants: { connect: { id: userId } } } }),
                prisma.categoryInvite.deleteMany({ where: { id: invite.id } }),
            ]);
        } else {
            await prisma.categoryInvite.deleteMany({ where: { id: invite.id } });
        }
        return NextResponse.json({ ok: true, categoryId: invite.categoryId });
    } catch (error) {
        console.error("[CATEGORY_INVITE_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

/** 거두기 — 카테고리를 만든 사람이 수락 전 초대를 지운다 (?id=) */
export const DELETE = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const invite = await prisma.categoryInvite.findUnique({ where: { id }, select: { id: true, category: { select: { creatorId: true } } } });
        if (!invite || invite.category.creatorId !== userId) {
            return NextResponse.json({ message: "초대를 찾을 수 없습니다." }, { status: 404 });
        }
        await prisma.categoryInvite.deleteMany({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[CATEGORY_INVITE_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};
