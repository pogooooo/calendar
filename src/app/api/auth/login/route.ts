import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { LoginSchema } from "@/lib/schema";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimiter";

// 로그인 Rate Limit: 10분 내 10회 초과 시 15분 차단
const LOGIN_LIMIT = { maxAttempts: 10, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 };

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
    const rl = checkRateLimit(`login:${ip}`, LOGIN_LIMIT);
    if (!rl.allowed) {
        return NextResponse.json(
            { message: `너무 많은 로그인 시도입니다. ${rl.retryAfter}초 후에 다시 시도해주세요.` },
            {
                status: 429,
                headers: { "Retry-After": String(rl.retryAfter) },
            }
        );
    }

    try {
        const body = await request.json();

        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: "입력값이 올바르지 않습니다." },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { settings: true },
        });

        // 이메일 존재 여부를 구분하지 않음 (계정 열거 공격 방지)
        if (!user || !user.password) {
            return NextResponse.json(
                { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        // 로그인 성공 → IP 차단 카운트 초기화
        resetRateLimit(`login:${ip}`);

        if (!user.settings) {
            await prisma.userSettings.create({ data: { userId: user.id } });
        }

        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                Token: refreshToken,
                expires: expiresAt,
            },
        });

        const cookieStore = await cookies();
        cookieStore.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return NextResponse.json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                theme: user.settings?.theme || "celestial",
            },
        });
    } catch (error) {
        console.error("LOGIN_ERROR", error);
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
