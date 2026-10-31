import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/apiAuth";
import { generateWidgetToken } from "@/lib/jwt";

/**
 * 홈 위젯 전용 열쇠를 내준다 (안드로이드 앱이 위젯 재료를 쓸 때 받아 같이 넣어 둔다).
 * 이 열쇠는 위젯 전용 할 일 API(/api/widget/todo)의 권한 있는 일정 조회·추가·수정·완료·삭제에만 쓴다.
 * 열쇠에는 사용자의 판 번호(tokenVersion)를 새긴다 — 비밀번호가 바뀌면 판이 올라 옛 열쇠는 끊긴다.
 */
export const POST = async (request: Request) => {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
    if (!user) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
    const token = await generateWidgetToken(userId, user.tokenVersion);
    return NextResponse.json({ token });
};
