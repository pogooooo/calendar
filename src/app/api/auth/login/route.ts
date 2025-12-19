import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return new NextResponse("이메일과 비밀번호가 필요합니다.", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { settings: true },
        });

        if (!user || !user.password) {
            return new NextResponse("사용자를 찾을 수 없습니다.", { status: 401 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return new NextResponse("비밀번호가 일치하지 않습니다.", { status: 401 });
        }

        if (!user.settings) {
            await prisma.userSettings.create({ data: { userId: user.id } });
        }

        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                sessionToken: refreshToken,
                expires: expiresAt,
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
        console.error("LOGIN_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
