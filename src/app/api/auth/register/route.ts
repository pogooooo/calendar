import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {RegisterSchema} from "@/lib/schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.message },
                { status: 400 }
            );
        }

        const { name, email, password } = body;

        const existingUser = await prisma.user.findUnique({where: { email: email }});
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

        await prisma.userSettings.create({ data: { userId: user.id } });

        await prisma.category.create({
            data: {
                name: "할 일",
                color: "#808080",
                creatorId: user.id,
                participants: {
                    connect: {id: user.id}
                }
            }
        })

        return NextResponse.json(user);
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
