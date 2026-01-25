import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// 사용자 인증 헬퍼 함수
const getUserId = (request: NextRequest): string | null => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) return null;

        const decoded = verifyToken(token) as { userId: string } | null;

        if (!decoded || !decoded.userId) return null;

        return decoded.userId;
    } catch (error) {
        return null;
    }
};

// 권한 확인 헬퍼 함수 (카테고리 접근 권한)
const checkCategoryPermission = async (categoryId: string, userId: string) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            participants: {
                select: { id: true }
            }
        }
    });

    if (!category) return null;

    const isCreator = category.creatorId === userId;
    const isParticipant = category.participants.some(p => p.id === userId);

    return isCreator || isParticipant ? category : null;
};

// GET: 투두 조회 (전체, 특정 카테고리별, 단일 항목)
export const GET = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const categoryId = searchParams.get("categoryId");
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (id) {
            const todo = await prisma.todo.findUnique({
                where: { id },
                include: { category: { include: { participants: true } } }
            });

            if (!todo) {
                return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });
            }

            const isCreator = todo.category.creatorId === userId;
            const isParticipant = todo.category.participants.some(p => p.id === userId);

            if (!isCreator && !isParticipant) {
                return NextResponse.json({ message: "조회 권한이 없습니다." }, { status: 403 });
            }

            return NextResponse.json(todo);
        }

        const dateFilter = (start && end) ? {
            OR: [
                { startAt: { gte: new Date(start), lte: new Date(end) } },
                { endAt: { gte: new Date(start), lte: new Date(end) } },
                { isAllDay: true } // 종일 일정 포함 로직은 필요에 따라 조정
            ]
        } : {};

        const todos = await prisma.todo.findMany({
            where: {
                ...dateFilter,
                category: categoryId
                    ? { id: categoryId }
                    : {
                        OR: [
                            { creatorId: userId },
                            { participants: { some: { id: userId } } }
                        ]
                    }
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
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            categoryId,
            memo,
            startAt,
            endAt,
            isAllDay,
            location,
            repeat
        } = body;

        if (!title || !categoryId) {
            return NextResponse.json({ message: "제목과 카테고리는 필수입니다." }, { status: 400 });
        }

        const hasPermission = await checkCategoryPermission(categoryId, userId);
        if (!hasPermission) {
            return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });
        }

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
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ message: "수정할 할 일 ID가 필요합니다." }, { status: 400 });
        }

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            include: { category: { include: { participants: true } } }
        });

        if (!existingTodo) {
            return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });
        }

        const isCreator = existingTodo.category.creatorId === userId;
        const isParticipant = existingTodo.category.participants.some(p => p.id === userId);

        if (!isCreator && !isParticipant) {
            return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
        }

        const dataToUpdate = { ...updateData };
        if (dataToUpdate.startAt) dataToUpdate.startAt = new Date(dataToUpdate.startAt);
        if (dataToUpdate.endAt) dataToUpdate.endAt = new Date(dataToUpdate.endAt);

        if (dataToUpdate.categoryId && dataToUpdate.categoryId !== existingTodo.categoryId) {
            const hasDestPermission = await checkCategoryPermission(dataToUpdate.categoryId, userId);
            if (!hasDestPermission) {
                return NextResponse.json({ message: "이동할 카테고리에 대한 권한이 없습니다." }, { status: 403 });
            }
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

// DELETE: 투두 삭제
export const DELETE = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "삭제할 할 일 ID가 필요합니다." }, { status: 400 });
        }

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            include: { category: { include: { participants: true } } }
        });

        if (!existingTodo) {
            return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });
        }

        const isCreator = existingTodo.category.creatorId === userId;
        const isParticipant = existingTodo.category.participants.some(p => p.id === userId);

        if (!isCreator && !isParticipant) {
            return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
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