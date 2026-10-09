import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, refreshCookie, refreshExpiresAt, rememberFrom } from "@/lib/jwt";
import { cookies } from "next/headers";
import { LoginSchema } from "@/lib/schema";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimiter";
import { userIdByEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";

// 로그인 Rate Limit: 10분 내 10회 초과 시 15분 차단
const LOGIN_LIMIT = { maxAttempts: 10, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 };

function getClientIP(req: NextRequest): string {
    // CF-Connecting-IP 는 Cloudflare 가 직접 채우므로 위조할 수 없다.
    // X-Forwarded-For 는 클라이언트가 임의로 보낼 수 있어 뒤로 미룬다.
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
    const rl = await checkRateLimit(`login:${ip}`, LOGIN_LIMIT);
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
        const body = await readJson(request);
        if (body === undefined) return badJson();

        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: "입력값이 올바르지 않습니다." },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;
        const remember = rememberFrom(body);

        // 대소문자를 가리지 않고 찾는다 — 폰 자판이 첫 글자를 대문자로 바꿔 가입한 계정도 (src/lib/userEmail.ts)
        const userId = await userIdByEmail(email);
        const user = userId ? await prisma.user.findUnique({
            where: { id: userId },
            include: { settings: true },
        }) : null;

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
        await resetRateLimit(`login:${ip}`);

        if (!user.settings) {
            // 로그인 단추를 두 번 누르면 둘 다 만들려다 유일 제약으로 500 이 났다 — 이미 있으면 됐다
            try {
                await prisma.userSettings.create({ data: { userId: user.id } });
            } catch (e) {
                if (!isUniqueViolation(e)) throw e;
            }
        }

        const accessToken = await generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = await generateRefreshToken({ userId: user.id }, remember);
        const expiresAt = refreshExpiresAt(remember);

        await prisma.refreshToken.deleteMany({
            where: { userId: user.id, expires: { lt: new Date() } },
        });
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                Token: refreshToken,
                expires: expiresAt,
            },
        });

        const cookieStore = await cookies();
        cookieStore.set(refreshCookie(refreshToken, remember));

        const isDesktop = request.headers.get("x-client") === "desktop";

        return NextResponse.json({
            accessToken,
            ...(isDesktop ? { refreshToken } : {}),
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
