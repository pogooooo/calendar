import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

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

export const GET = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { participants: { some: { id: userId } } }
                ]
            },
            include: {
                participants: true,
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORY_GET_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const POST = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, color } = body;

        if (!name) {
            return NextResponse.json({ message: "카테고리 이름이 필요합니다." }, { status: 400 });
        }

        if (id) {
            const existingCategory = await prisma.category.findUnique({ where: { id } });
            if (!existingCategory || existingCategory.creatorId !== userId) {
                return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
            }

            const updatedCategory = await prisma.category.update({
                where: { id },
                data: {
                    name,
                    color,
                },
            });

            return NextResponse.json(updatedCategory);
        } else {
            const newCategory = await prisma.category.create({
                data: {
                    name,
                    color: color || "#808080",
                    creatorId: userId,
                    participants: {
                        connect: { id: userId }
                    }
                },
            });

            return NextResponse.json(newCategory);
        }

    } catch (error) {
        console.error("[CATEGORY_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "삭제할 카테고리 ID가 필요합니다." }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) {
            return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });
        }

        if (existingCategory.creatorId !== userId) {
            return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: "카테고리가 삭제되었습니다." });

    } catch (error) {
        console.error("[CATEGORY_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};
