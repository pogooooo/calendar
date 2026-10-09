import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";
import { emailInUse, normalizeEmail } from "@/lib/userEmail";

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
        const body = await request.json();

        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            // 첫 번째 에러 메시지만 반환 (상세 내부 구조 노출 방지)
            const firstError = validation.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }

        // validation.data 사용 (raw body 대신)
        const { name, password } = validation.data;
        // 새 계정은 소문자로 저장하고, 대소문자만 다른 기존 계정도 같은 주소로 본다 (src/lib/userEmail.ts)
        const email = normalizeEmail(validation.data.email);

        const taken = { message: "이미 사용 중인 이메일입니다." };
        if (await emailInUse(email)) {
            return NextResponse.json(taken, { status: 409 });
        }

        // bcrypt rounds 12 (10 → 12, 보안 강화)
        const hashedPassword = await bcrypt.hash(password, 12);

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

        return NextResponse.json({ message: "회원가입이 완료되었습니다." }, { status: 201 });
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
