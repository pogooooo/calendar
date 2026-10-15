import { publicUserSelect } from "@/lib/publicUser";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { CreateCategorySchema, UpdateCategorySchema } from "@/lib/schema";
import { normalizeEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";
import { checkRateLimit } from "@/lib/rateLimiter";
import { INVITE_TTL_MS, purgeExpiredInvites } from "@/lib/categoryInvite";

/** 수락 전 초대는 카테고리를 만든 사람에게만 보인다 — 다른 참여자에게는 아직 동의하지 않은 사람의 주소다 */
const inviteSelect = { select: { id: true, email: true, expiresAt: true }, orderBy: { createdAt: "asc" as const } };
type WithInvites = { creatorId: string; invites?: unknown };
function hideInvites<T extends WithInvites>(category: T, userId: string): T {
    if (category.creatorId === userId) return category;
    const rest = { ...category };
    delete rest.invites;
    return rest;
}

const getUserId = async (request: NextRequest): Promise<string | null> => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = await verifyToken(token) as { userId: string } | null;
        return decoded?.userId ?? null;
    } catch {
        return null;
    }
};

export const GET = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await purgeExpiredInvites();

        if (id) {
            const category = await prisma.category.findUnique({
                where: { id },
                include: { participants: { select: publicUserSelect }, todos: true, invites: inviteSelect }
            });

            if (!category) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

            const isCreator = category.creatorId === userId;
            const isParticipant = category.participants.some(p => p.id === userId);
            if (!isCreator && !isParticipant) {
                return NextResponse.json({ message: "조회 권한이 없습니다." }, { status: 403 });
            }

            return NextResponse.json(hideInvites(category, userId));
        }

        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { participants: { some: { id: userId } } }
                ]
            },
            include: { participants: { select: publicUserSelect }, invites: inviteSelect }
        });

        // 내가 만든 카테고리가 앞에 — 화면은 맨 앞 카테고리를 빠른 추가의 기본으로 쓴다(남이 만든 것이 기본이 되지 않게)
        const ordered = [...categories.filter((c) => c.creatorId === userId), ...categories.filter((c) => c.creatorId !== userId)];
        return NextResponse.json(ordered.map((c) => hideInvites(c, userId)));
    } catch (error) {
        console.error("[CATEGORY_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const POST = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await readJson(request);
        if (body === undefined) return badJson();
        const parsed = CreateCategorySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { name, color, description } = parsed.data;

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        if (!user) return NextResponse.json({ message: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });

        const newCategory = await prisma.category.create({
            data: {
                name,
                color,
                description,
                creatorId: userId,
                creatorName: user.name,
                participants: { connect: { id: userId } }
            },
            include: { participants: { select: publicUserSelect } }
        });

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error("[CATEGORY_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const PATCH = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await readJson(request);
        if (body === undefined) return badJson();
        const parsed = UpdateCategorySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { id, name, color, description, addParticipantEmail, removeParticipantId } = parsed.data;

        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: { participants: { select: { id: true } } }
        });

        if (!existingCategory) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

        const isCreator = existingCategory.creatorId === userId;
        const isParticipant = existingCategory.participants.some(p => p.id === userId);
        if (!isCreator && !isParticipant) {
            return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
        }
        // 초대·내보내기는 만든 사람만, 참여자는 자기 자신만 뺄 수 있다(나가기).
        // 예전엔 참여자가 해도 200 으로 조용히 넘어가서 창은 닫히는데 아무 일도 없었고, 참여자는 나갈 길이 없었다
        if (addParticipantEmail && !isCreator) {
            return NextResponse.json({ message: "멤버 초대는 카테고리를 만든 사람만 할 수 있습니다." }, { status: 403 });
        }
        if (removeParticipantId && !isCreator && removeParticipantId !== userId) {
            return NextResponse.json({ message: "다른 멤버를 내보내는 것은 카테고리를 만든 사람만 할 수 있습니다." }, { status: 403 });
        }

        type ParticipantOp = { connect?: { id: string }; disconnect?: { id: string } };
        const updateData: {
            name?: string;
            color?: string;
            description?: string;
            participants?: ParticipantOp;
        } = {};

        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (description !== undefined) updateData.description = description;

        if (addParticipantEmail && isCreator) {
            // 바로 넣지 않고 초대를 건다 — 받는 사람이 수락해야 참여자가 된다(src/lib/categoryInvite.ts).
            // 가입한 주소든 아니든 같은 답을 준다(가입 여부를 캐지 못하게). 같은 사람이 짧은 사이에 너무 많이 걸지 못하게 센다
            const rl = await checkRateLimit(`invite:${userId}`, { maxAttempts: 30, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 });
            if (!rl.allowed) {
                return NextResponse.json({ message: `초대를 너무 많이 보냈습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` }, { status: 429 });
            }
            const email = normalizeEmail(addParticipantEmail);
            const me = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
            if (me?.email && normalizeEmail(me.email) === email) {
                return NextResponse.json({ message: "자기 자신은 초대할 수 없습니다." }, { status: 400 });
            }
            await purgeExpiredInvites();
            await prisma.categoryInvite.upsert({
                where: { categoryId_email: { categoryId: id, email } },
                create: { categoryId: id, email, inviterId: userId, expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
                update: { inviterId: userId, expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
            });
        }

        if (removeParticipantId) {
            if (removeParticipantId === existingCategory.creatorId) {
                return NextResponse.json({ message: "제작자 본인은 삭제할 수 없습니다." }, { status: 400 });
            }
            updateData.participants = { ...updateData.participants, disconnect: { id: removeParticipantId } };
        }

        const update = prisma.category.update({
            where: { id },
            data: updateData,
            include: { participants: { select: publicUserSelect }, invites: inviteSelect }
        });

        // 빠진 사람은 이 카테고리의 프로젝트·작업 담당에서도 뺀다 — 예전엔 나간 뒤에도 담당자로 남아 남은 사람들 화면에 보였다
        const assigned = removeParticipantId ? await Promise.all([
            prisma.project.findMany({ where: { categoryId: id, assignees: { some: { id: removeParticipantId } } }, select: { id: true } }),
            prisma.projectTask.findMany({ where: { project: { categoryId: id }, assignees: { some: { id: removeParticipantId } } }, select: { id: true } }),
        ]) : null;
        const [updatedCategory] = removeParticipantId && assigned && (assigned[0].length || assigned[1].length)
            ? await prisma.$transaction([
                update,
                prisma.user.update({
                    where: { id: removeParticipantId },
                    data: { assignedProjects: { disconnect: assigned[0] }, assignedTasks: { disconnect: assigned[1] } },
                    select: { id: true },
                }),
            ])
            : [await update];

        return NextResponse.json(hideInvites(updatedCategory, userId));
    } catch (error) {
        console.error("[CATEGORY_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const existingCategory = await prisma.category.findUnique({
            where: { id },
            select: { creatorId: true }
        });

        if (!existingCategory) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

        if (existingCategory.creatorId !== userId) {
            return NextResponse.json({ message: "카테고리 삭제 권한은 제작자에게만 있습니다." }, { status: 403 });
        }

        // Category→Todo 에 cascade 가 없어 할 일이 하나라도 있으면 삭제가 실패한다
        await prisma.$transaction([
            prisma.todoCompletion.deleteMany({ where: { todo: { categoryId: id } } }),
            prisma.todo.deleteMany({ where: { categoryId: id } }),
            prisma.category.delete({ where: { id } }),
        ]);
        return NextResponse.json({ message: "카테고리가 삭제되었습니다." });
    } catch (error) {
        console.error("[CATEGORY_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};
