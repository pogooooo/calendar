import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimiter";

// 회원가입 Rate Limit: 1시간 내 5회 초과 시 1시간 차단
const REGISTER_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);

    // ── Rate Limit 체크 ──────────────────────────────────────────────────────
    const rl = checkRateLimit(`register:${ip}`, REGISTER_LIMIT);
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
            const firstError = validation.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }

        // validation.data 사용 (raw body 대신)
        const { name, email, password } = validation.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });
        }

        // bcrypt rounds 12 (10 → 12, 보안 강화)
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        await prisma.userSettings.create({ data: { userId: user.id } });

        await prisma.category.create({
            data: {
                name: "할 일",
                color: "#808080",
                creatorId: user.id,
                creatorName: user.name,
                participants: {},
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
