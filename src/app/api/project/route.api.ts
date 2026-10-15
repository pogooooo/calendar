import { publicUserSelect } from "@/lib/publicUser";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { CreateProjectSchema, UpdateProjectSchema } from '@/lib/schema';
import { getUserId, categoryAccessWhere, checkCategoryPermission, onlyCategoryMembers } from '@/lib/apiAuth';
import { readJson, badJson } from "@/lib/readJson";

/**
 * 선행 할 일은 id·제목·상태만 싣는다 (할 일 라우트와 같게). 통째로 실으면 다른 카테고리에 있는 선행 할 일의
 * 메모·날짜까지 나갔다 — 그 카테고리에서 빠진 뒤에도
 */
const blockedBySelect = { select: { id: true, title: true, status: true } } as const;

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        const projects = await prisma.project.findMany({
            where: {
                category: categoryAccessWhere(userId),
                ...(categoryId ? { categoryId } : {}),
            },
            include: {
                assignees: { select: publicUserSelect },
                tasks: {
                    include: {
                        blockedBy: blockedBySelect,
                        assignees: { select: publicUserSelect },
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("[PROJECT_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await readJson(request);
        if (body === undefined) return badJson();
        const parsed = CreateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { title, description, categoryId, startAt, endAt, assignees } = parsed.data;

        const hasPermission = await checkCategoryPermission(categoryId, userId);
        if (!hasPermission) return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });

        const assigneeIds = await onlyCategoryMembers(categoryId, assignees ?? []);
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                categoryId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                assignees: assigneeIds.length ? {
                    connect: assigneeIds.map((id) => ({ id }))
                } : undefined,
            },
            include: { assignees: { select: publicUserSelect } }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("[PROJECT_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await readJson(request);
        if (body === undefined) return badJson();
        const parsed = UpdateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, startAt, endAt, assignees, ...rest } = parsed.data;

        const owned = await prisma.project.findFirst({
            where: { id, category: categoryAccessWhere(userId) },
            select: { id: true, categoryId: true },
        });
        if (!owned) return NextResponse.json({ message: "프로젝트를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
        // 옮겨 갈 카테고리도 내가 쓸 수 있는 곳이어야 한다
        if (rest.categoryId && !(await checkCategoryPermission(rest.categoryId, userId))) {
            return NextResponse.json({ message: "카테고리를 찾을 수 없거나 권한이 없습니다." }, { status: 403 });
        }
        const moving = !!rest.categoryId && rest.categoryId !== owned.categoryId;
        // 다른 카테고리로 옮기면 담당자도 그 카테고리 사람으로 걸러야 한다 — 예전엔 옛 카테고리 사람이 남아
        // 그 이름·이메일·사진이 새 카테고리 사람들에게 보였다(작업 담당자도 아래에서 같이 거른다)
        const current = !assignees && moving
            ? (await prisma.project.findUnique({ where: { id }, select: { assignees: { select: { id: true } } } }))?.assignees.map((a) => a.id) ?? []
            : null;
        const assigneeIds = assignees
            ? await onlyCategoryMembers(rest.categoryId ?? owned.categoryId, assignees)
            : current ? await onlyCategoryMembers(rest.categoryId!, current) : null;

        if (moving) {
            // 작업: 담당자는 새 카테고리 사람만, 다른 프로젝트 작업과의 선행 연결은 끊는다(그 제목·상태가 넘어가 보이지 않게)
            const tasks = await prisma.projectTask.findMany({
                where: { projectId: id },
                select: {
                    id: true,
                    assignees: { select: { id: true } },
                    blockedBy: { select: { id: true, projectId: true } },
                    blocking: { select: { id: true, projectId: true } },
                },
            });
            for (const task of tasks) {
                const keep = await onlyCategoryMembers(rest.categoryId!, task.assignees.map((a) => a.id));
                const outBy = task.blockedBy.filter((b) => b.projectId !== id).map((b) => ({ id: b.id }));
                const outOf = task.blocking.filter((b) => b.projectId !== id).map((b) => ({ id: b.id }));
                if (keep.length === task.assignees.length && !outBy.length && !outOf.length) continue;
                await prisma.projectTask.update({
                    where: { id: task.id },
                    data: {
                        assignees: { set: keep.map((uid) => ({ id: uid })) },
                        ...(outBy.length ? { blockedBy: { disconnect: outBy } } : {}),
                        ...(outOf.length ? { blocking: { disconnect: outOf } } : {}),
                    },
                });
            }
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...rest,
                ...(startAt !== undefined ? { startAt: startAt ? new Date(startAt) : null } : {}),
                ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
                ...(assigneeIds ? { assignees: { set: assigneeIds.map((uid) => ({ id: uid })) } } : {}),
            },
            include: {
                assignees: { select: publicUserSelect },
                tasks: {
                    include: { blockedBy: blockedBySelect, assignees: { select: publicUserSelect } }
                }
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("[PROJECT_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const owned = await prisma.project.findFirst({
            where: { id, category: categoryAccessWhere(userId) },
            select: { id: true },
        });
        if (!owned) return NextResponse.json({ message: "프로젝트를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });

        await prisma.project.delete({ where: { id } });

        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[PROJECT_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
