import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const getUserId = (request: NextRequest): string | null => {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) return null;
        const decoded = verifyToken(token) as { userId: string } | null;
        return decoded?.userId || null;
    } catch (error) {
        return null;
    }
};

// GET: 내 설정 가져오기
export const GET = async (request: NextRequest) => {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        let settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId, theme: "celestial" }
            });
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
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { theme } = body;

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