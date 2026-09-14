import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyToken, refreshCookie, refreshExpiresAt } from "@/lib/jwt";
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

        // 로그인 때 정한 "유지" 여부는 토큰에 새겨져 있다. 옛 토큰(없음)은 유지로 본다.
        const remember = payload.remember !== false;
        const newAccessToken = await generateAccessToken({ userId: session.userId, email: session.user.email });
        const newRefreshToken = await generateRefreshToken({ userId: session.userId }, remember);
        const expiresAt = refreshExpiresAt(remember);

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

        cookieStore.set(refreshCookie(newRefreshToken, remember));

        const isDesktop = request.headers.get("x-client") === "desktop";

        return NextResponse.json({
            accessToken: newAccessToken,
            ...(isDesktop ? { refreshToken: newRefreshToken } : {}),
        });

    } catch (error) {
        // 로그가 없으면 일시 장애와 진짜 만료를 구분할 근거가 사라진다
        console.error("[auth/refresh] 실패:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
