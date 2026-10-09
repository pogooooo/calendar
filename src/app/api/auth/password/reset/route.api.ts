import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ResetPasswordSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";
import { RESET_IDENTIFIER_PREFIX, hashResetToken } from "@/lib/passwordReset";
import { userIdByEmail } from "@/lib/userEmail";

// 재설정 실행 Rate Limit: 10분 내 10회 초과 시 15분 차단 (토큰 무차별 대입 방지)
const RESET_LIMIT = { maxAttempts: 10, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

const INVALID = { message: "링크가 만료되었거나 이미 사용되었습니다. 다시 요청해주세요." };

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);

    const rl = await checkRateLimit(`reset:${ip}`, RESET_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `요청이 너무 잦습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
            { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
        );
    }

    try {
        const body = await request.json();

        const validation = ResetPasswordSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }

        const { token, password } = validation.data;

        const record = await prisma.verificationToken.findUnique({
            where: { token: await hashResetToken(token) },
        });

        // 다른 용도의 토큰을 여기로 들고 오는 것도 막는다.
        if (!record || !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) {
            return NextResponse.json(INVALID, { status: 400 });
        }

        if (record.expires < new Date()) {
            await prisma.verificationToken.deleteMany({ where: { token: record.token } });
            return NextResponse.json(INVALID, { status: 400 });
        }

        // 식별자는 소문자다 — 대문자가 섞여 저장된 예전 계정도 찾아야 한다 (src/lib/userEmail.ts)
        const email = record.identifier.slice(RESET_IDENTIFIER_PREFIX.length);
        const userId = await userIdByEmail(email);
        const user = userId ? { id: userId } : null;

        if (!user) {
            await prisma.verificationToken.deleteMany({ where: { token: record.token } });
            return NextResponse.json(INVALID, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 12);

        // 토큰은 1회용이다. 지우는 쪽이 이긴다 — 같은 링크로 두 요청이 겹쳐도 한 번만 바뀐다
        const claimed = await prisma.verificationToken.deleteMany({ where: { token: record.token } });
        if (claimed.count === 0) return NextResponse.json(INVALID, { status: 400 });

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });

        await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

        // 비밀번호가 바뀌었으니 기존 세션을 전부 끊는다 — 계정을 탈취당한 상태에서
        // 재설정한 경우 공격자의 리프레시 토큰도 같이 죽어야 한다.
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

        return NextResponse.json({
            message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.",
        });
    } catch (error) {
        console.error("RESET_PASSWORD_ERROR", error);
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 },
        );
    }
}
