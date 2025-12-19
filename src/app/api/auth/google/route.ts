import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, googleId, image } = body;

        if (!email || !googleId) {
            return new NextResponse("필수 정보 누락", { status: 400 });
        }

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

        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id });

        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.session.create({
            data: {
                userId: user.id,
                sessionToken: refreshToken,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                theme: user.settings?.theme || 'celestial'
            }
        });

    } catch (error) {
        console.error("GOOGLE_LOGIN_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
