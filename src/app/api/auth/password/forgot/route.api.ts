import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ForgotPasswordSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";
import { buildResetMail, sendMail } from "@/lib/mailer";
import { userIdByEmail } from "@/lib/userEmail";
import {
    RESET_TOKEN_TTL_MS,
    buildResetUrl,
    generateResetToken,
    hashResetToken,
    resetIdentifier,
} from "@/lib/passwordReset";

// 재설정 요청 Rate Limit: 1시간 내 5회 초과 시 1시간 차단
const FORGOT_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

// 계정 존재 여부를 노출하지 않기 위해, 어떤 경우에도 같은 응답을 준다.
const GENERIC_OK = {
    message: "해당 이메일로 가입된 계정이 있다면 재설정 링크를 보냈습니다.",
};

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);

    const rl = await checkRateLimit(`forgot:${ip}`, FORGOT_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `요청이 너무 잦습니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
            { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
        );
    }

    try {
        const body = await request.json();

        const validation = ForgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }

        // 대소문자를 가리지 않고 찾는다 — 예전엔 소문자로만 찾아서 대문자가 섞여 가입한 계정에는 메일이 안 갔다
        const userId = await userIdByEmail(validation.data.email);
        const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }) : null;

        // 계정이 없어도 성공 응답을 준다 (계정 열거 방지).
        if (!user?.email) return NextResponse.json(GENERIC_OK);
        const email = user.email;

        const identifier = resetIdentifier(email);

        // 같은 계정의 이전 링크는 무효화한다 — 항상 마지막 링크 하나만 살아 있게.
        await prisma.verificationToken.deleteMany({ where: { identifier } });

        const token = generateResetToken();
        const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

        await prisma.verificationToken.create({
            data: { identifier, token: await hashResetToken(token), expires },
        });

        const result = await sendMail(
            buildResetMail(
                email,
                buildResetUrl(token, request.url),
                Math.round(RESET_TOKEN_TTL_MS / 60000),
            ),
        );

        if (result.error) console.error("FORGOT_PASSWORD_MAIL_ERROR", result.error);

        return NextResponse.json(GENERIC_OK);
    } catch (error) {
        console.error("FORGOT_PASSWORD_ERROR", error);
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 },
        );
    }
}
