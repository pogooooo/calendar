import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWidgetToken } from "@/lib/jwt";
import { categoryAccessWhere, checkCategoryPermission } from "@/lib/apiAuth";
import { CreateTodoSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";

/**
 * 홈 위젯에서 앱을 열지 않고 할 일 하나를 넣는다 (안드로이드의 QuickAddActivity 가 부른다).
 *
 * 열쇠는 위젯 전용(/api/widget/token)이라 이 길 말고는 못 쓴다. 그 사용자가 모든 기기에서 로그아웃했거나
 * (살아 있는 리프레시 토큰이 없으면) 그 뒤로 비밀번호가 바뀌었으면(판 번호가 다르면) 열쇠가 아직 안 끝났어도 받지 않는다
 * — 다시 로그인하라는 뜻의 401. 예전엔 비밀번호를 바꿔도 흘러나간 열쇠가 30일 동안 들었다.
 * 카테고리를 안 주거나 못 쓰는 것이면 앱의 빠른 추가처럼 첫 카테고리에 넣는다.
 */
export const POST = async (request: Request) => {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        const claim = token ? await verifyWidgetToken(token) : null;
        if (!claim) return NextResponse.json({ message: "앱을 열어 다시 로그인해 주세요." }, { status: 401 });
        const userId = claim.userId;
        const owner = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
        if (!owner || owner.tokenVersion !== claim.version) return NextResponse.json({ message: "앱을 열어 다시 로그인해 주세요." }, { status: 401 });

        const rl = await checkRateLimit(`widget-todo:${userId}`, { maxAttempts: 30, windowMs: 60_000, blockMs: 60_000 });
        if (!rl.allowed) return NextResponse.json({ message: "잠시 뒤에 다시 시도해 주세요." }, { status: 429 });

        const live = await prisma.refreshToken.count({ where: { userId, expires: { gt: new Date() } } });
        if (live === 0) return NextResponse.json({ message: "앱을 열어 다시 로그인해 주세요." }, { status: 401 });

        const body = await request.json().catch(() => null) as Record<string, unknown> | null;
        if (!body) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });

        let categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
        if (!categoryId || !(await checkCategoryPermission(categoryId, userId))) {
            const first = await prisma.category.findFirst({ where: categoryAccessWhere(userId), select: { id: true } });
            if (!first) return NextResponse.json({ message: "앱에서 카테고리를 먼저 만들어 주세요." }, { status: 400 });
            categoryId = first.id;
        }

        const parsed = CreateTodoSchema.safeParse({ ...body, categoryId });
        if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        const { title, memo, startAt, endAt, isAllDay, location } = parsed.data;

        const todo = await prisma.todo.create({
            data: {
                title,
                categoryId,
                memo,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                isAllDay: isAllDay ?? false,
                location,
            },
            include: { completions: true },
        });
        return NextResponse.json(todo);
    } catch (error) {
        console.error("[WIDGET_TODO_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};
