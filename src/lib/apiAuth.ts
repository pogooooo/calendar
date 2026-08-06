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
