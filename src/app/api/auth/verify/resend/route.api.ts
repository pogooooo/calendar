import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { ForgotPasswordSchema } from "@/lib/schema";
import { userIdByEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";
import { buildVerifyMail, redactMailError, sendMail } from "@/lib/mailer";
import { VERIFY_TOKEN_TTL_MS, buildVerifyUrl, issueVerification, purgeStaleUnverified } from "@/lib/emailVerification";

// 다시 보내기: 1시간 내 5회 초과 시 1시간 차단 (남의 메일함에 메일을 퍼붓지 못하게)
const RESEND_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

// 가입 여부·인증 여부를 드러내지 않게 어떤 경우에도 같은 답
const GENERIC_OK = { message: "인증하지 않은 가입이 있는 주소라면 인증 메일을 다시 보냈습니다." };

/** 인증 메일 다시 보내기 — 로그인 화면(인증 전 계정)과 가입 뒤 화면에서 부른다 */
export async function POST(request: NextRequest) {
    const rl = await checkRateLimit(`verify-resend:${getClientIP(request)}`, RESEND_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `요청이 너무 잦습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
            { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
        );
    }

    try {
        const body = await readJson(request);
        if (body === undefined) return badJson();
        const parsed = ForgotPasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." }, { status: 400 });
        }

        await purgeStaleUnverified();

        const userId = await userIdByEmail(parsed.data.email);
        const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true, password: true } }) : null;
        if (!user?.email || user.emailVerified || !user.password) return NextResponse.json(GENERIC_OK);

        const token = await issueVerification(user.email);
        const result = await sendMail(buildVerifyMail(user.email, buildVerifyUrl(token, request.url), Math.round(VERIFY_TOKEN_TTL_MS / 3_600_000)));
        if (result.error) console.error("VERIFY_RESEND_MAIL_ERROR", redactMailError(result.error));

        return NextResponse.json(GENERIC_OK);
    } catch (error) {
        console.error("VERIFY_RESEND_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }
}
