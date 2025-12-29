import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import {cookies} from "next/headers";

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

            await prisma.category.create({
                data: {
                    name: "할 일",
                    color: "#808080",
                    isDefault: true,
                    creatorId: user.id,
                    participants: {
                        connect: {id: user.id}
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

        const accessToken = generateAccessToken({userId: user.id, email: user.email});
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
            accessToken,
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
