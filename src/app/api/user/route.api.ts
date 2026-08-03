import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { passwordSchema } from "@/lib/schema";

// 토큰에서 userId 추출
async function getUserId(request: NextRequest): Promise<string | null> {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    try {
        const payload = await verifyToken(auth.slice(7)) as { userId: string } | null;
        return payload?.userId ?? null;
    } catch {
        return null;
    }
}

// ── PATCH: 프로필 수정 (이름 / 비밀번호) ─────────────────────────────────────
export async function PATCH(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) {
        return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, currentPassword, newPassword } = body as {
            name?: string;
            currentPassword?: string;
            newPassword?: string;
        };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const updateData: { name?: string; password?: string } = {};

        // 이름 변경
        if (name !== undefined) {
            if (name.trim().length < 2) {
                return NextResponse.json({ message: "이름은 2자 이상이어야 합니다." }, { status: 400 });
            }
            updateData.name = name.trim();
        }

        // 비밀번호 변경
        if (newPassword !== undefined) {
            if (!currentPassword) {
                return NextResponse.json({ message: "현재 비밀번호를 입력해주세요." }, { status: 400 });
            }
            if (!user.password) {
                return NextResponse.json({ message: "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다." }, { status: 400 });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
            }
            const pwCheck = passwordSchema.safeParse(newPassword);
            if (!pwCheck.success) {
                return NextResponse.json({ message: pwCheck.error.issues[0]?.message ?? "비밀번호 형식이 올바르지 않습니다." }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, email: true, name: true, image: true },
        });

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error("USER_PATCH_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// ── DELETE: 회원 탈퇴 ─────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) {
        return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { password } = body as { password?: string };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        // 이메일/비밀번호 계정은 비밀번호 확인
        if (user.password) {
            if (!password) {
                return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 400 });
            }
        }

        // 연관 데이터 삭제 후 계정 삭제
        await prisma.$transaction([
            prisma.refreshToken.deleteMany({ where: { userId } }),
            prisma.userSettings.deleteMany({ where: { userId } }),
            prisma.dailyTask.deleteMany({ where: { userId } }),
            prisma.dailyMemo.deleteMany({ where: { userId } }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    assignedProjects: { set: [] },
                    assignedTasks:    { set: [] },
                    participatingCategories: { set: [] },
                },
            }),
            prisma.user.delete({ where: { id: userId } }),
        ]);

        return NextResponse.json({ message: "계정이 삭제되었습니다." });
    } catch (error) {
        console.error("USER_DELETE_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
