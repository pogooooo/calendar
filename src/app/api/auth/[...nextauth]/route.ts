import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";


export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // 구글 로그인 설정
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

        }),
        // 이메일/비밀번호 로그인 설정
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) {
                    throw new Error("이메일과 비밀번호를 입력해주세요.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("해당 이메일로 가입된 사용자가 없습니다.");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("비밀번호가 일치하지 않습니다.");
                }

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET!,
    pages: {
        signIn: "/login",
    },

    events: {
        async signIn({ user }) {
            // 로그인 성공 직후, 해당 사용자의 설정을 확인합니다.
            if (user.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { settings: true },
                    });

                    // 사용자 정보가 있고, 설정이 아직 없는 경우에만 기본 설정을 생성합니다.
                    if (existingUser && !existingUser.settings) {
                        await prisma.userSettings.create({
                            data: {
                                userId: existingUser.id,
                            },
                        });
                        console.log(`Default settings created for user: ${user.email}`);
                    }
                } catch (error) {
                    // 로그인 흐름을 막지 않기 위해 에러는 콘솔에만 기록합니다.
                    console.error("Failed to create user settings on sign-in:", error);
                }
            }
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

