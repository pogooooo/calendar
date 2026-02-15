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

// GET: 카테고리 조회
export const GET = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            const category = await prisma.category.findUnique({
                where: { id },
                include: { participants: true, todos: true }
            });

            if (!category) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

            const isCreator = category.creatorId === userId;
            const isParticipant = category.participants.some(p => p.id === userId);

            if (!isCreator && !isParticipant) return NextResponse.json({ message: "조회 권한이 없습니다." }, { status: 403 });

            return NextResponse.json(category);
        }

        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { participants: { some: { id: userId } } }
                ]
            },
            include: { participants: true }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// POST: 카테고리 생성 (수정과 분리됨)
export const POST = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const { name, color, description } = body;

        if (!name || !color) {
            return NextResponse.json({ message: "이름과 색상은 필수입니다." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

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
            include: { participants: true }
        });

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error("[CATEGORY_POST_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// PATCH: 카테고리 정보 수정 및 참가자 관리
export const PATCH = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const body = await request.json();
        const { id, name, color, description, addParticipantEmail, removeParticipantId } = body;

        if (!id) return NextResponse.json({ message: "카테고리 ID가 필요합니다." }, { status: 400 });

        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: { participants: { select: { id: true } } }
        });

        if (!existingCategory) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

        // 권한 확인: 제작자만 이름/색상 수정 및 참가자 초대를 할 수 있도록 제한 (필요시 참가자도 허용 가능)
        const isCreator = existingCategory.creatorId === userId;
        const isParticipant = existingCategory.participants.some(p => p.id === userId);

        if (!isCreator && !isParticipant) {
            return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
        }

        // 업데이트 데이터 준비
        const updateData: any = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (description !== undefined) updateData.description = description;

        // 참가자 추가 로직 (이메일로 초대)
        if (addParticipantEmail && isCreator) {
            const userToInvite = await prisma.user.findUnique({ where: { email: addParticipantEmail } });
            if (!userToInvite) {
                return NextResponse.json({ message: "해당 이메일의 사용자를 찾을 수 없습니다." }, { status: 404 });
            }
            updateData.participants = { connect: { id: userToInvite.id } };
        }

        // 참가자 삭제 로직
        if (removeParticipantId && isCreator) {
            // 제작자 본인은 삭제할 수 없음
            if (removeParticipantId === existingCategory.creatorId) {
                return NextResponse.json({ message: "제작자 본인은 삭제할 수 없습니다." }, { status: 400 });
            }
            updateData.participants = { ...updateData.participants, disconnect: { id: removeParticipantId } };
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: updateData,
            include: { participants: true }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("[CATEGORY_PATCH_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};

// DELETE: 카테고리 삭제
export const DELETE = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID가 필요합니다." }, { status: 400 });

        const existingCategory = await prisma.category.findUnique({
            where: { id },
            select: { creatorId: true }
        });

        if (!existingCategory) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

        // 삭제는 제작자만 가능하도록 제한
        if (existingCategory.creatorId !== userId) {
            return NextResponse.json({ message: "카테고리 삭제 권한은 제작자에게만 있습니다." }, { status: 403 });
        }

        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ message: "카테고리가 삭제되었습니다." });
    } catch (error) {
        console.error("[CATEGORY_DELETE_ERROR]", error);
        return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
    }
};