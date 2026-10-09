import { NextRequest, NextResponse } from "next/server";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { CreateTodoSchema, ToggleTodoSchema, UpdateTodoSchema } from "@/lib/schema";

const getUserId = async (request: NextRequest): Promise<string | null> => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = await verifyToken(token) as { userId: string } | null;
        return decoded?.userId || null;
    } catch {
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

        if ((start && Number.isNaN(Date.parse(start))) || (end && Number.isNaN(Date.parse(end)))) {
            return NextResponse.json({ message: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
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
        if (body?.targetDate !== undefined) {
            const toggled = ToggleTodoSchema.safeParse(body);
            if (!toggled.success) {
                return NextResponse.json({ message: toggled.error.issues[0].message }, { status: 400 });
            }
            const { id: todoId, targetDate, completed } = toggled.data;

            // 다른 분기와 달리 여기만 권한 검사가 빠져 있어, 남의 카테고리 일정도 토글됐다
            const target = await prisma.todo.findUnique({
                where: { id: todoId },
                select: { categoryId: true }
            });
            if (!target) {
                return NextResponse.json({ message: "대상을 찾을 수 없습니다." }, { status: 404 });
            }
            if (!(await checkCategoryPermission(target.categoryId, userId))) {
                return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
            }

            // 클라이언트가 사용자의 시간대로 계산한 날짜 키만 받는다.
            // 순간(instant)을 받으면 UTC 정규화 과정에서 하루가 밀린다.
            const dayKey = String(targetDate).slice(0, 10);
            const dateObj = new Date(`${dayKey}T00:00:00.000Z`);
            // 2026-13-45 처럼 모양만 맞는 날은 Invalid Date 로 500 이 났다 — 되읽어 같은 날인지 본다
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey) || Number.isNaN(dateObj.getTime()) || dateObj.toISOString().slice(0, 10) !== dayKey) {
                return NextResponse.json({ message: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
            }

            const existing = await prisma.todoCompletion.findFirst({
                where: { todoId, targetDate: dateObj }
            });

            // 바라는 상태가 오면 그대로 둔다. 뒤집기만 하면 다른 기기에서 이미 끝낸 것을 옛 화면에서 누를 때 도로 풀렸다
            const done = completed ?? !existing;
            if (!done) {
                // deleteMany — 두 요청이 겹쳐도 P2025 로 500 이 나지 않는다
                await prisma.todoCompletion.deleteMany({ where: { todoId, targetDate: dateObj } });
                return NextResponse.json({ message: "완료 취소됨" });
            }
            if (!existing) {
                try {
                    await prisma.todoCompletion.create({ data: { todoId, targetDate: dateObj } });
                } catch (e) {
                    // 겹친 요청이 먼저 만들었으면 이미 끝난 것이다
                    if (!isUniqueViolation(e)) throw e;
                }
            }
            return NextResponse.json({ message: "완료됨" });
        }

        const parsedUpdate = UpdateTodoSchema.safeParse(body);
        if (!parsedUpdate.success) {
            return NextResponse.json({ message: parsedUpdate.error.issues[0].message }, { status: 400 });
        }
        const { id, startAt: rawStartAt, endAt: rawEndAt, repeatEndDate: rawRepeatEnd, shiftCompletionsDays, ...updateData } = parsedUpdate.data;

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

        // 끝냄 기록을 날짜만큼 옮긴다 — 하나씩 고치면 이웃한 날끼리 (todoId, targetDate) 유일 제약에 걸리므로 지우고 다시 쓴다
        const shift = shiftCompletionsDays ?? 0;
        const moved = shift
            ? (await prisma.todoCompletion.findMany({ where: { todoId: id }, select: { targetDate: true } }))
                .map((c) => ({ todoId: id, targetDate: new Date(c.targetDate.getTime() + shift * 86_400_000) }))
            : [];
        const update = prisma.todo.update({
            where: { id },
            data: dataToUpdate,
            include: { completions: true }
        });
        const updatedTodo = moved.length
            ? (await prisma.$transaction([
                prisma.todoCompletion.deleteMany({ where: { todoId: id } }),
                prisma.todoCompletion.createMany({ data: moved }),
                update,
            ]))[2]
            : await update;

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