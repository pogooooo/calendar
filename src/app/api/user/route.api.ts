import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { refreshCandidates, verifyToken } from "@/lib/jwt";
import { NAME_MAX, passwordSchema } from "@/lib/schema";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimiter";
import { deleteUserData } from "@/lib/deleteUser";

/**
 * 현재 비밀번호 확인(비밀번호 바꾸기·탈퇴)의 시도 수 제한.
 * 흘러나간 접근 토큰(1시간)만으로 비밀번호를 끝없이 맞혀 보고 계정을 빼앗지 못하게 — 로그인과 같은 한도
 */
async function passwordGuard(userId: string) {
    const rl = await checkRateLimit(`password-check:${userId}`, { maxAttempts: 10, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 });
    if (rl.allowed) return null;
    return NextResponse.json(
        { message: `너무 많이 시도했습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
}

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
        const body = await request.json().catch(() => null);
        const { name, currentPassword, newPassword } = (body ?? {}) as {
            name?: unknown;
            currentPassword?: unknown;
            newPassword?: unknown;
        };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const updateData: { name?: string; password?: string; tokenVersion?: { increment: number } } = {};

        // 이름 변경 (글자가 아니면 trim 에서 터져 500 이 났다)
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 2) {
                return NextResponse.json({ message: "이름은 2자 이상이어야 합니다." }, { status: 400 });
            }
            if (name.trim().length > NAME_MAX) {
                return NextResponse.json({ message: `이름은 ${NAME_MAX}자를 넘을 수 없습니다.` }, { status: 400 });
            }
            updateData.name = name.trim();
        }

        // 비밀번호 변경
        if (newPassword !== undefined) {
            if (typeof currentPassword !== "string" || !currentPassword) {
                return NextResponse.json({ message: "현재 비밀번호를 입력해주세요." }, { status: 400 });
            }
            if (!user.password) {
                return NextResponse.json({ message: "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다." }, { status: 400 });
            }
            const tooMany = await passwordGuard(userId);
            if (tooMany) return tooMany;
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
            }
            await resetRateLimit(`password-check:${userId}`);
            const pwCheck = passwordSchema.safeParse(newPassword);
            if (!pwCheck.success) {
                return NextResponse.json({ message: pwCheck.error.issues[0]?.message ?? "비밀번호 형식이 올바르지 않습니다." }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(pwCheck.data, 12);
            // 그 전에 내준 홈 위젯 열쇠를 끊는다 (src/lib/jwt.ts 의 generateWidgetToken)
            updateData.tokenVersion = { increment: 1 };
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, email: true, name: true, image: true },
        });

        // 카테고리의 "만든 사람" 은 이름을 따로 적어 둔다 — 같이 바꾸지 않으면 함께 쓰는 사람에게 옛 이름이 남았다
        if (updateData.name) {
            await prisma.category.updateMany({ where: { creatorId: userId }, data: { creatorName: updateData.name } });
        }

        // 비밀번호가 바뀌면 다른 기기의 세션을 끊는다(재설정과 같은 까닭 — 훔친 세션이 남지 않게).
        // 이 기기의 살아 있는 토큰(웹은 쿠키, 앱은 X-Refresh-Token)이 왔을 때만. 모르거나 방금 회전돼 1분 유예 중인
        // 토큰이면 이 기기의 새 토큰이 어느 것인지 알 수 없어 이 기기까지 끊게 되므로 예전처럼 둔다
        if (updateData.password) {
            const cookieStore = await cookies();
            const current = cookieStore.get("refreshToken")?.value ?? request.headers.get("x-refresh-token") ?? undefined;
            const keys = current ? await refreshCandidates(current) : [];
            const mine = current
                ? await prisma.refreshToken.findFirst({ where: { Token: { in: keys } }, select: { userId: true, expires: true } })
                : null;
            if (current && mine?.userId === userId && mine.expires.getTime() > Date.now() + 2 * 60_000) {
                await prisma.refreshToken.deleteMany({ where: { userId, NOT: { Token: { in: keys } } } });
            }
        }

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
        const { password } = (body ?? {}) as { password?: unknown };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        // 이메일/비밀번호 계정은 비밀번호 확인
        if (user.password) {
            if (typeof password !== "string" || !password) {
                return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
            }
            const tooMany = await passwordGuard(userId);
            if (tooMany) return tooMany;
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 400 });
            }
        }

        // 적은 것·세션·남은 링크·이 주소로 온 초대까지 모두 (src/lib/deleteUser.ts)
        await deleteUserData(userId, user.email);

        return NextResponse.json({ message: "계정이 삭제되었습니다." });
    } catch (error) {
        console.error("USER_DELETE_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
