import { NextResponse, NextRequest } from "next/server";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, refreshCookie, refreshExpiresAt, rememberFrom } from "@/lib/jwt";
import {cookies} from "next/headers";
import { normalizeEmail, userIdByEmail } from "@/lib/userEmail";

const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleTokenInfo {
    aud?: string;
    azp?: string;
    sub?: string;
    email?: string;
    email_verified?: string | boolean;
    expires_in?: string;
    error?: string;
    error_description?: string;
}

interface GoogleUserInfo {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
}

async function verifyGoogleAccessToken(accessToken: string) {
    const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!tokenInfoRes.ok) return null;

    const tokenInfo = (await tokenInfoRes.json()) as GoogleTokenInfo;

    if (tokenInfo.error) return null;

    const audience = tokenInfo.aud ?? tokenInfo.azp;
    if (!GOOGLE_CLIENT_ID || audience !== GOOGLE_CLIENT_ID) return null;

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userInfoRes.ok) return null;

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;

    const sub = tokenInfo.sub ?? userInfo.sub;
    const email = tokenInfo.email ?? userInfo.email;
    const emailVerified =
        tokenInfo.email_verified === true ||
        tokenInfo.email_verified === "true" ||
        userInfo.email_verified === true;

    if (!sub || !email || !emailVerified) return null;

    return {
        googleId: sub,
        email,
        name: userInfo.name ?? email.split("@")[0],
        image: userInfo.picture ?? null,
    };
}

export async function POST(request: NextRequest) {
    try {
        if (!GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_LOGIN_ERROR: GOOGLE_CLIENT_ID 미설정");
            return NextResponse.json({ message: "서버 설정 오류입니다." }, { status: 500 });
        }

        const body = await request.json();
        const { accessToken } = body as { accessToken?: string };

        if (!accessToken) {
            return NextResponse.json({ message: "토큰이 필요합니다." }, { status: 400 });
        }

        const verified = await verifyGoogleAccessToken(accessToken);
        if (!verified) {
            return NextResponse.json({ message: "유효하지 않은 구글 인증입니다." }, { status: 401 });
        }

        const { email, name, googleId, image } = verified;

        // 대소문자만 다르게 가입한 계정도 같은 사람이다 — 예전엔 못 찾아서 계정을 하나 더 만들었다 (src/lib/userEmail.ts)
        const existingId = await userIdByEmail(email);
        let user = existingId ? await prisma.user.findUnique({
            where: { id: existingId },
            include: { settings: true }
        }) : null;

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: normalizeEmail(email),
                    name,
                    image,
                    settings: { create: {} },
                },
                include: { settings: true }
            });

            await prisma.category.create({
                data: {
                    name: "할 일",
                    color: "#808080",
                    creatorId: user.id,
                    creatorName: user.name,
                    // 만든 이도 참여자 — 다른 카테고리처럼 (가입 라우트와 같다)
                    participants: { connect: { id: user.id } },
                }
            })
        }

        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: googleId,
                },
            },
        });

        if (!existingAccount) {
            try {
                await prisma.account.create({
                    data: {
                        userId: user.id,
                        type: "oauth",
                        provider: "google",
                        providerAccountId: googleId,
                    },
                });
            } catch (e) {
                // 두 요청이 겹쳐 이미 이어졌으면 그대로 간다
                if (!isUniqueViolation(e)) throw e;
            }
        }

        const newAccessToken = await generateAccessToken({userId: user.id, email: user.email});
        const remember = rememberFrom(body);
        const refreshToken = await generateRefreshToken({ userId: user.id }, remember);

        // 만료된 것만 지운다 (이메일 로그인과 같게). 전부 지우면 구글로 한 번 들어올 때마다
        // 다른 기기(데스크톱·폰 앱)와 홈 위젯이 모두 로그아웃됐다
        await prisma.refreshToken.deleteMany({ where: { userId: user.id, expires: { lt: new Date() } } });
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                Token: refreshToken,
                expires: refreshExpiresAt(remember),
            },
        });

        const cookieStore = await cookies();
        cookieStore.set(refreshCookie(refreshToken, remember));

        const isDesktop = request.headers.get("x-client") === "desktop";

        return NextResponse.json({
            accessToken: newAccessToken,
            ...(isDesktop ? { refreshToken } : {}),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                theme: user.settings?.theme || 'celestial'
            }
        });

    } catch (error) {
        console.error("GOOGLE_LOGIN_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
