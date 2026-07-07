import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import {cookies} from "next/headers";

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

        let user = await prisma.user.findUnique({
            where: { email },
            include: { settings: true }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
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
                    participants: {
                    }
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
            await prisma.account.create({
                data: {
                    userId: user.id,
                    type: "oauth",
                    provider: "google",
                    providerAccountId: googleId,
                },
            });
        }

        const newAccessToken = generateAccessToken({userId: user.id, email: user.email});
        const refreshToken = generateRefreshToken({ userId: user.id });

        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                Token: refreshToken,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return NextResponse.json({
            accessToken: newAccessToken,
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
