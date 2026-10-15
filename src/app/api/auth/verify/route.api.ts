import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { hashResetToken } from "@/lib/passwordReset";
import { VERIFY_IDENTIFIER_PREFIX, purgeStaleUnverified } from "@/lib/emailVerification";
import { userIdByEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";

// 인증 링크 대입 방지: 10분 내 20회 초과 시 15분 차단
const VERIFY_LIMIT = { maxAttempts: 20, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

const INVALID = { message: "링크가 만료되었거나 이미 사용되었습니다. 로그인 화면에서 인증 메일을 다시 받아 주세요." };

/**
 * 가입 이메일 인증 — 메일의 링크(/verifyEmail?token=…)를 연 화면이 토큰을 보낸다(src/lib/emailVerification.ts).
 * 토큰은 1회용이고 24시간 산다. 이미 인증된 계정이면 그대로 성공으로 본다.
 */
export async function POST(request: NextRequest) {
    const rl = await checkRateLimit(`verify:${getClientIP(request)}`, VERIFY_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `요청이 너무 잦습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
            { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
        );
    }

    try {
        const body = await readJson(request);
        if (body === undefined) return badJson();
        const token = (body as { token?: unknown }).token;
        if (typeof token !== "string" || !token) return NextResponse.json(INVALID, { status: 400 });

        await purgeStaleUnverified();

        const record = await prisma.verificationToken.findUnique({ where: { token: await hashResetToken(token) } });
        // 다른 용도(비밀번호 재설정)의 토큰을 여기로 들고 오는 것도 막는다
        if (!record || !record.identifier.startsWith(VERIFY_IDENTIFIER_PREFIX)) {
            return NextResponse.json(INVALID, { status: 400 });
        }
        if (record.expires < new Date()) {
            // 지우지 않는다 — 7일 뒤 미인증 가입을 치울 때 이 줄로 찾는다 (purgeStaleUnverified)
            return NextResponse.json(INVALID, { status: 400 });
        }

        const email = record.identifier.slice(VERIFY_IDENTIFIER_PREFIX.length);
        const userId = await userIdByEmail(email);
        if (!userId) {
            await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
            return NextResponse.json(INVALID, { status: 400 });
        }

        // 1회용 — 지우는 쪽이 이긴다(같은 링크로 두 요청이 겹쳐도 한 번만)
        const claimed = await prisma.verificationToken.deleteMany({ where: { token: record.token } });
        if (claimed.count === 0) return NextResponse.json(INVALID, { status: 400 });

        await prisma.user.updateMany({ where: { id: userId, emailVerified: null }, data: { emailVerified: new Date() } });

        return NextResponse.json({ message: "인증이 끝났습니다. 이제 로그인할 수 있습니다." });
    } catch (error) {
        console.error("VERIFY_EMAIL_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }
}
