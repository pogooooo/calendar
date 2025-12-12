"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {ThemeProvider} from "styled-components";
import theme from "@/styles/theme";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div>로딩 중...</div>;
    }

    if (status === "authenticated") {
        return (
            <ThemeProvider theme={theme}>
                <h1>환영합니다, {session.user?.name || session.user?.email}님!</h1>
                <pre>{JSON.stringify(session, null, 2)}</pre>
                <button onClick={() => signOut()}>로그아웃</button>
            </ThemeProvider>
        );
    }

    return null;
}
