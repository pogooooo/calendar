import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (refreshToken) {
            await prisma.session.deleteMany({
                where: { sessionToken: refreshToken },
            });
        }

        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("LOGOUT_ERROR", error);
        return NextResponse.json({ message: "Error logging out" }, { status: 500 });
    }
}
