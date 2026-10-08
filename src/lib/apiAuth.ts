import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export const getUserId = async (request: Request): Promise<string | null> => {
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

export const categoryAccessWhere = (userId: string) => ({
    OR: [
        { creatorId: userId },
        { participants: { some: { id: userId } } },
    ],
});

export const checkCategoryPermission = async (categoryId: string, userId: string) => {
    const category = await prisma.category.findFirst({
        where: { id: categoryId, ...categoryAccessWhere(userId) },
        select: { id: true },
    });
    return !!category;
};

/**
 * 담당자로 걸 수 있는 사람만 남긴다 — 그 카테고리를 만든 이와 참여자.
 * 예전엔 아무 id 나 받아서, 없는 id 는 500 이 났고 남의 id 를 넣으면 그 사람의 이름·이메일이 응답에 실려 나왔다.
 * 카테고리에서 빠진 사람이 담당자 목록에 남아 있어도 다음 저장 때 조용히 빠진다(옛 앱이 그대로 보내도 저장은 된다).
 */
export const onlyCategoryMembers = async (categoryId: string, ids: string[]): Promise<string[]> => {
    if (ids.length === 0) return [];
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { creatorId: true, participants: { select: { id: true } } },
    });
    if (!category) return [];
    const members = new Set([category.creatorId, ...category.participants.map((p) => p.id)]);
    return [...new Set(ids)].filter((id) => members.has(id));
};
