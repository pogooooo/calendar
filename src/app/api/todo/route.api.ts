import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { CreateTodoSchema, ToggleTodoSchema, UpdateTodoSchema } from "@/lib/schema";

const getUserId = async (request: NextRequest): Promise<string | null> => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = await verifyToken(token) as { userId: string } | null;
        return decoded?.userId || null;
    } catch (error) {
        return null;
    }
};

const checkCategoryPermission = async (categoryId: string, userId: string) => {
    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            OR: [
                { creatorId: userId },
                { participants: { some: { id: userId } } }
            ]
        },
        select: { id: true }
    });
    return !!category;
};

export const GET = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const categoryId = searchParams.get("categoryId");
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (id) {
            const todo = await prisma.todo.findFirst({
                where: {
                    id,
                    category: {
                        OR: [
                            { creatorId: userId },
                            { participants: { some: { id: userId } } }
                        ]
                    }
                },
                include: { completions: true }
            });

            if (!todo) return NextResponse.json({ message: "할 일을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
            return NextResponse.json(todo);
        }

        let targetCategoryIds: string[] = [];

        if (categoryId) {
            const hasPerm = await checkCategoryPermission(categoryId, userId);
            if (!hasPerm) return NextResponse.json({ message: "조회 권한이 없습니다." }, { status: 403 });
            targetCategoryIds = [categoryId];
        } else {
            const userCategories = await prisma.category.findMany({
                where: {
                    OR: [
                        { creatorId: userId },
                        { participants: { some: { id: userId } } }
                    ]
                },
                select: { id: true }
            });
            targetCategoryIds = userCategories.map(c => c.id);
        }

        if (targetCategoryIds.length === 0) {
            return NextResponse.json([]);
        }

        const dateFilter = (start && end) ? {
            OR: [
                { startAt: { gte: new Date(start), lte: new Date(end) } },
                { endAt: { gte: new Date(start), lte: new Date(end) } },
                { isAllDay: true }
            ]
        } : {};

        const todos = await prisma.todo.findMany({
            where: {
                ...dateFilter,
                categoryId: { in: targetCategoryIds }
            },
            include: { completions: true },
            orderBy: {
                startAt: 'asc',
            }
        });

        return NextResponse.json(todos);

    } catch (error) {
        console.error("[TODO_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// POST: 투두 생성
export const POST = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const parsed = CreateTodoSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, categoryId, memo, startAt, endAt, isAllDay, location, repeat, repeatEndDate, repeatCount } = parsed.data;

        const hasPermission = await checkCategoryPermission(categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });

        const newTodo = await prisma.todo.create({
            data: {
                title,
                categoryId,
                memo,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                isAllDay: isAllDay ?? false,
                location,
                repeat: repeat ?? 0,
                repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : null,
                repeatCount: repeatCount ?? null,
            },
            include: { completions: true }
        });

        return NextResponse.json(newTodo);

    } catch (error) {
        console.error("[TODO_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// PATCH: 투두 수정 및 완료(Completion) 토글
export const PATCH = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();

        // targetDate 있으면 완료 토글, 없으면 내용 수정
        if (body.targetDate !== undefined) {
            const toggled = ToggleTodoSchema.safeParse(body);
            if (!toggled.success) {
                return NextResponse.json({ message: toggled.error.issues[0].message }, { status: 400 });
            }
            const { id: todoId, targetDate } = toggled.data;

            const dateObj = new Date(targetDate);
            dateObj.setUTCHours(0, 0, 0, 0);

            const existing = await prisma.todoCompletion.findFirst({
                where: { todoId, targetDate: dateObj }
            });

            if (existing) {
                await prisma.todoCompletion.delete({ where: { id: existing.id } });
                return NextResponse.json({ message: "완료 취소됨" });
            } else {
                await prisma.todoCompletion.create({ data: { todoId, targetDate: dateObj } });
                return NextResponse.json({ message: "완료됨" });
            }
        }

        const parsedUpdate = UpdateTodoSchema.safeParse(body);
        if (!parsedUpdate.success) {
            return NextResponse.json({ message: parsedUpdate.error.issues[0].message }, { status: 400 });
        }
        const { id, startAt: rawStartAt, endAt: rawEndAt, repeatEndDate: rawRepeatEnd, ...updateData } = parsedUpdate.data;

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            select: { categoryId: true }
        });

        if (!existingTodo) return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });

        const hasPermission = await checkCategoryPermission(existingTodo.categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });

        const dataToUpdate: Record<string, unknown> = { ...updateData };
        if (rawStartAt) dataToUpdate.startAt = new Date(rawStartAt);
        if (rawEndAt) dataToUpdate.endAt = new Date(rawEndAt);

        if (rawRepeatEnd) {
            dataToUpdate.repeatEndDate = new Date(rawRepeatEnd);
        } else if (rawRepeatEnd === null) {
            dataToUpdate.repeatEndDate = null;
        }

        if (updateData.categoryId && updateData.categoryId !== existingTodo.categoryId) {
            const hasDestPermission = await checkCategoryPermission(updateData.categoryId, userId);
            if (!hasDestPermission) return NextResponse.json({ message: "이동할 카테고리에 대한 권한이 없습니다." }, { status: 403 });
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: dataToUpdate,
            include: { completions: true }
        });

        return NextResponse.json(updatedTodo);

    } catch (error) {
        console.error("[TODO_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const targetDate = searchParams.get("targetDate");

        if (!id) return NextResponse.json({ message: "삭제할 할 일 ID가 필요합니다." }, { status: 400 });

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            select: { categoryId: true, repeat: true, excludedDates: true }
        });

        if (!existingTodo) return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });

        const hasPermission = await checkCategoryPermission(existingTodo.categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });

        if (targetDate && existingTodo.repeat > 0) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
                return NextResponse.json({ message: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
            }

            let excluded: string[] = [];
            try {
                const parsed = JSON.parse(existingTodo.excludedDates ?? "[]");
                if (Array.isArray(parsed)) excluded = parsed.filter(v => typeof v === "string");
            } catch {}

            if (!excluded.includes(targetDate)) excluded.push(targetDate);

            const updated = await prisma.todo.update({
                where: { id },
                data: { excludedDates: JSON.stringify(excluded) },
                include: { completions: true }
            });

            return NextResponse.json(updated);
        }

        await prisma.todo.delete({
            where: { id },
        });

        return NextResponse.json({ message: "할 일이 삭제되었습니다." });

    } catch (error) {
        console.error("[TODO_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};