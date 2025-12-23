import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, verifyToken } from "@/lib/jwt";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

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

        const payload = verifyToken(refreshToken);
        if (!payload) {
            return new NextResponse(
                JSON.stringify({ message: "손상된 토큰입니다." }),
                { status: 403 }
            );
        }

        const newAccessToken = generateAccessToken({ userId: session.userId, email: session.user.email });

        return NextResponse.json({ accessToken: newAccessToken });

    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
