import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (refreshToken) {
            await prisma.session.deleteMany({
                where: { sessionToken: refreshToken },
            });
        }

        cookieStore.delete("refreshToken");

        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("LOGOUT_ERROR", error);
        return NextResponse.json({ message: "Error logging out" }, { status: 500 });
    }
}
