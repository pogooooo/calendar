import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return new NextResponse("필수 정보가 누락되었습니다.", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if(existingUser) {
            return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
