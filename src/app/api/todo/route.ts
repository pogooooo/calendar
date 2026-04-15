import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const getUserId = (request: NextRequest): string | null => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = verifyToken(token) as { userId: string } | null;
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

// GET: 투두 조회
export const GET = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
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
                }
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
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const {
            title, categoryId, memo, startAt, endAt,
            isAllDay, location, repeat, repeatEndDate, repeatCount
        } = body;

        if (!title || !categoryId) return NextResponse.json({ message: "제목과 카테고리는 필수입니다." }, { status: 400 });

        const hasPermission = await checkCategoryPermission(categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });

        const newTodo = await prisma.todo.create({
            data: {
                title,
                categoryId,
                memo,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                isAllDay: isAllDay || false,
                location,
                repeat: repeat || 0,
                repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : null,
                repeatCount: repeatCount || null,
                check: "none",
            },
        });

        return NextResponse.json(newTodo);

    } catch (error) {
        console.error("[TODO_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// PATCH: 투두 수정
export const PATCH = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ message: "수정할 할 일 ID가 필요합니다." }, { status: 400 });

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            select: { categoryId: true }
        });

        if (!existingTodo) return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });

        const hasPermission = await checkCategoryPermission(existingTodo.categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });

        const dataToUpdate = { ...updateData };
        if (dataToUpdate.startAt) dataToUpdate.startAt = new Date(dataToUpdate.startAt);
        if (dataToUpdate.endAt) dataToUpdate.endAt = new Date(dataToUpdate.endAt);

        if (dataToUpdate.repeatEndDate) {
            dataToUpdate.repeatEndDate = new Date(dataToUpdate.repeatEndDate);
        } else if (dataToUpdate.repeatEndDate === null) {
            dataToUpdate.repeatEndDate = null;
        }

        if (dataToUpdate.categoryId && dataToUpdate.categoryId !== existingTodo.categoryId) {
            const hasDestPermission = await checkCategoryPermission(dataToUpdate.categoryId, userId);
            if (!hasDestPermission) return NextResponse.json({ message: "이동할 카테고리에 대한 권한이 없습니다." }, { status: 403 });
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(updatedTodo);

    } catch (error) {
        console.error("[TODO_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "삭제할 할 일 ID가 필요합니다." }, { status: 400 });

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            select: { categoryId: true }
        });

        if (!existingTodo) return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });

        const hasPermission = await checkCategoryPermission(existingTodo.categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });

        await prisma.todo.delete({
            where: { id },
        });

        return NextResponse.json({ message: "할 일이 삭제되었습니다." });

    } catch (error) {
        console.error("[TODO_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};