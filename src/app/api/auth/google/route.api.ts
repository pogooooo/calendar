import { NextResponse, NextRequest } from "next/server";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, refreshCookie, refreshExpiresAt, refreshKey, rememberFrom } from "@/lib/jwt";
import {cookies} from "next/headers";
import { normalizeEmail, userIdByEmail } from "@/lib/userEmail";
import { readJson, badJson } from "@/lib/readJson";

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

        const body = await readJson(request);
        if (body === undefined) return badJson();
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

        if (user && !user.emailVerified) {
            // 비밀번호로 가입만 하고 인증하지 않은 계정 — 그 비밀번호는 이 주소의 주인이 정한 것인지 알 수 없다.
            // 구글이 주소의 주인을 확인해 줬으므로 계정을 넘겨받되, 남이 정했을지 모르는 비밀번호와 그 세션은 지운다.
            // 예전엔 그대로 이어서, 남의 주소로 먼저 가입해 둔 사람이 주인의 자료를 볼 수 있었다
            await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
            user = await prisma.user.update({
                where: { id: user.id },
                data: { password: null, emailVerified: new Date(), tokenVersion: { increment: 1 } },
                include: { settings: true },
            });
        }

        if (!user) {
            // 처음 들어오는 구글 계정 — 만 14세 이상인지 먼저 묻는다(개인정보보호법 제22조의2). 화면이 확인을 받아 다시 부른다
            if ((body as { ageConfirmed?: unknown }).ageConfirmed !== true) {
                return NextResponse.json(
                    { code: "AGE_CONFIRM_REQUIRED", message: "처음 가입하시네요. 만 14세 이상인지 확인해 주세요." },
                    { status: 409 },
                );
            }
            user = await prisma.user.create({
                data: {
                    email: normalizeEmail(email),
                    name,
                    image,
                    // 구글이 확인한 주소다
                    emailVerified: new Date(),
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
                // 원문이 아니라 해시를 적는다 (src/lib/jwt.ts 의 refreshKey)
                Token: await refreshKey(refreshToken),
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
