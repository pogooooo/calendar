import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, refreshCookie, refreshExpiresAt, refreshCandidates, refreshKey } from "@/lib/jwt";
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

        // DB 에는 해시가 있다. 해시로 바꾸기 전(2026-10-15)에 적힌 원문 줄도 찾는다 — 그 줄은 여기서 회전되며 사라진다
        const session = await prisma.refreshToken.findFirst({
            where: { Token: { in: await refreshCandidates(refreshToken) } },
            include: { user: true },
        });

        if (!session) {
            return new NextResponse(
                JSON.stringify({ message: "유효하지 않은 토큰입니다." }),
                { status: 403 }
            );
        }

        if (new Date() > session.expires) {
            // deleteMany — 창 여럿이 같은 만료 토큰을 동시에 내밀면 delete 는 둘째에서 P2025 로 500 이 됐다
            await prisma.refreshToken.deleteMany({ where: { id: session.id } });
            return new NextResponse(
                JSON.stringify({ message: "만료된 토큰입니다. 다시 로그인해주세요." }),
                { status: 403 }
            );
        }

        const payload = await verifyRefreshToken(refreshToken);
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
            data: { userId: session.userId, Token: await refreshKey(newRefreshToken), expires: expiresAt },
        });
        // 옛 토큰은 1분만 더 산다(동시에 갱신한 다른 창 몫). 줄이기만 하고 늘리지는 않는다 —
        // 예전엔 쓸 때마다 다시 1분을 줘서, 회전된 토큰도 1분 안에 거듭 쓰면 끝없이 살아 있었다
        const graceEnd = new Date(Date.now() + 60_000);
        await prisma.refreshToken.updateMany({
            where: { id: session.id, expires: { gt: graceEnd } },
            data: { expires: graceEnd },
        });
        await prisma.refreshToken.deleteMany({
            where: { userId: session.userId, expires: { lt: new Date() } },
        });

        cookieStore.set(refreshCookie(newRefreshToken, remember));

        const isDesktop = request.headers.get("x-client") === "desktop";

        return NextResponse.json({
            accessToken: newAccessToken,
            ...(isDesktop ? { refreshToken: newRefreshToken } : {}),
            // 토큰만 쿠키로 되살린 창("로그인 유지" 를 끄고 연 새 탭)은 사용자 정보가 없어 이름·오늘 메모가 비었다
            user: { id: session.user.id, email: session.user.email, name: session.user.name, image: session.user.image },
        });

    } catch (error) {
        // 로그가 없으면 일시 장애와 진짜 만료를 구분할 근거가 사라진다
        console.error("[auth/refresh] 실패:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
