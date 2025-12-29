import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import {cookies} from "next/headers";
import { LoginSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.message },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { settings: true },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                {message: "이메일 또는 비밀번호가 올바르지 않습니다."},
                { status: 401 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                {message: "이메일 또는 비밀번호가 올바르지 않습니다."},
                { status: 401 }
            );
        }

        if (!user.settings) {
            await prisma.userSettings.create({ data: { userId: user.id } });
        }

        const accessToken = generateAccessToken({userId: user.id, email: user.email});
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
        console.error("LOGIN_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
