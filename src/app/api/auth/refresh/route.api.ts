import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/lib/jwt";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken =
            cookieStore.get("refreshToken")?.value ??
            request.headers.get("x-refresh-token") ??
            undefined;

        if (!refreshToken) {
            return new NextResponse(
                JSON.stringify({ message: "토큰이 없습니다." }),
                { status: 401 }
            );
        }

        const session = await prisma.refreshToken.findUnique({
            where: { Token: refreshToken },
            include: { user: true },
        });

        if (!session) {
            return new NextResponse(
                JSON.stringify({ message: "유효하지 않은 토큰입니다." }),
                { status: 403 }
            );
        }

        if (new Date() > session.expires) {
            await prisma.refreshToken.delete({ where: { id: session.id } });
            return new NextResponse(
                JSON.stringify({ message: "만료된 토큰입니다. 다시 로그인해주세요." }),
                { status: 403 }
            );
        }

        const payload = await verifyToken(refreshToken);
        if (!payload) {
            return new NextResponse(
                JSON.stringify({ message: "손상된 토큰입니다." }),
                { status: 403 }
            );
        }

        const newAccessToken = await generateAccessToken({ userId: session.userId, email: session.user.email });
        const newRefreshToken = await generateRefreshToken({ userId: session.userId });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: { userId: session.userId, Token: newRefreshToken, expires: expiresAt },
        });
        await prisma.refreshToken.update({
            where: { id: session.id },
            data: { expires: new Date(Date.now() + 60_000) },
        });
        await prisma.refreshToken.deleteMany({
            where: { userId: session.userId, expires: { lt: new Date() } },
        });

        cookieStore.set({
            name: "refreshToken",
            value: newRefreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        const isDesktop = request.headers.get("x-client") === "desktop";

        return NextResponse.json({
            accessToken: newAccessToken,
            ...(isDesktop ? { refreshToken: newRefreshToken } : {}),
        });

    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
