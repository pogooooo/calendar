import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";
import { normalizeEmail, userIdByEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";
import { buildVerifyMail, redactMailError, sendMail } from "@/lib/mailer";
import { VERIFY_TOKEN_TTL_MS, buildVerifyUrl, issueVerification, purgeStaleUnverified } from "@/lib/emailVerification";

// 회원가입 Rate Limit: 1시간 내 5회 초과 시 1시간 차단
const REGISTER_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

/**
 * 가입 — 계정을 만들고 인증 메일을 보낸다. 메일의 링크를 눌러야 로그인할 수 있다(src/lib/emailVerification.ts).
 * 만 14세 이상 확인(ageConfirmed)이 있어야 한다 — 14세 미만은 법정대리인 동의 없이 받지 않는다(개인정보보호법 제22조의2).
 */
export async function POST(request: NextRequest) {
    const ip = getClientIP(request);

    // ── Rate Limit 체크 ──────────────────────────────────────────────────────
    const rl = await checkRateLimit(`register:${ip}`, REGISTER_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `잠시 후 다시 시도해주세요. (${rl.retryAfter}초 후 가능)` },
            { status: 429 }
        );
    }

    try {
        const body = await readJson(request);
        if (body === undefined) return badJson();

        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            // 첫 번째 에러 메시지만 반환 (상세 내부 구조 노출 방지)
            const firstError = validation.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }

        await purgeStaleUnverified();

        // validation.data 사용 (raw body 대신)
        const { name, password } = validation.data;
        // 새 계정은 소문자로 저장하고, 대소문자만 다른 기존 계정도 같은 주소로 본다 (src/lib/userEmail.ts)
        const email = normalizeEmail(validation.data.email);

        // bcrypt rounds 12 (10 → 12, 보안 강화)
        const hashedPassword = await bcrypt.hash(password, 12);

        const taken = { message: "이미 사용 중인 이메일입니다." };
        const existingId = await userIdByEmail(email);
        let userEmail = email;
        if (existingId) {
            const existing = await prisma.user.findUnique({ where: { id: existingId }, select: { id: true, email: true, emailVerified: true } });
            if (!existing || existing.emailVerified) return NextResponse.json(taken, { status: 409 });
            // 인증 안 된 채 남은 가입 — 로그인할 수 없는 계정이라 지금 적은 이름·비밀번호로 덮어쓴다.
            // 끝내는 것은 그 메일함을 가진 사람뿐이다. 예전처럼 막으면 남이 먼저 적어 둔 주소로는 진짜 주인이 가입할 수 없었다
            await prisma.user.update({ where: { id: existing.id }, data: { name, password: hashedPassword } });
            await prisma.category.updateMany({ where: { creatorId: existing.id }, data: { creatorName: name } });
            userEmail = existing.email ?? email;
        } else {
            let user;
            try {
                user = await prisma.user.create({
                    data: { name, email, password: hashedPassword },
                });
            } catch (e) {
                // 가입 단추를 두 번 눌러 두 요청이 겹치면 뒤의 것이 유일 제약에 걸린다 — 500 이 아니라 409
                if (isUniqueViolation(e)) return NextResponse.json(taken, { status: 409 });
                throw e;
            }

            await prisma.userSettings.create({ data: { userId: user.id } });

            await prisma.category.create({
                data: {
                    name: "할 일",
                    color: "#808080",
                    creatorId: user.id,
                    creatorName: user.name,
                    // 만든 이도 참여자 — 다른 카테고리처럼. 예전엔 비워 둬서 담당자 고르개에 자기가 없고 멤버 수가 0 이었다
                    participants: { connect: { id: user.id } },
                },
            });
        }

        const token = await issueVerification(userEmail);
        const result = await sendMail(buildVerifyMail(userEmail, buildVerifyUrl(token, request.url), Math.round(VERIFY_TOKEN_TTL_MS / 3_600_000)));
        if (result.error) console.error("REGISTER_VERIFY_MAIL_ERROR", redactMailError(result.error));

        return NextResponse.json(
            { message: "인증 메일을 보냈습니다. 메일의 링크를 눌러 가입을 마쳐 주세요.", verify: true },
            { status: 201 },
        );
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
