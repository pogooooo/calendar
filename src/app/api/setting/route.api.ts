import { NextRequest, NextResponse } from "next/server";
import prisma, { isUniqueViolation } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const getUserId = async (request: NextRequest): Promise<string | null> => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = await verifyToken(token) as { userId: string } | null;
        return decoded?.userId || null;
    } catch {
        return null;
    }
};

// GET: 내 설정 가져오기
export const GET = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // 창 여럿(위젯)이 켜질 때 함께 읽으면 둘 다 만들려다 유일 제약으로 500 이 났다.
        // D1 의 upsert 는 찾고-만들기 두 번이라 그래도 겹칠 수 있다 — 그때는 먼저 만든 것을 읽는다
        let settings;
        try {
            settings = await prisma.userSettings.upsert({
                where: { userId },
                update: {},
                create: { userId, theme: "celestial" },
            });
        } catch (e) {
            if (!isUniqueViolation(e)) throw e;
            settings = await prisma.userSettings.findUnique({ where: { userId } });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[SETTINGS_GET_ERROR]", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
};

// PATCH: 테마 등 설정 변경하기
export const PATCH = async (request: NextRequest) => {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await request.json().catch(() => null);
        const raw: unknown = body?.theme;
        // 글자가 아니면 Prisma 가 500 을 냈다. 이름은 가리지 않는다 — 옛 앱이 보내는 테마 이름도 받아 둔다(화면이 모르면 기본으로 그린다)
        if (raw !== undefined && (typeof raw !== "string" || raw.length === 0 || raw.length > 64)) {
            return NextResponse.json({ message: "테마 값이 올바르지 않습니다." }, { status: 400 });
        }
        const theme = raw as string | undefined;

        const updatedSettings = await prisma.userSettings.upsert({
            where: { userId },
            update: { theme },
            create: { userId, theme }
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error("[SETTINGS_PATCH_ERROR]", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
};