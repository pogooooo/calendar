"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {ThemeProvider} from "styled-components";
import theme from "@/styles/theme";

export default function Home() {
    // useSession 훅을 사용하여 로그인 상태와 세션 정보를 가져옵니다.
    const { data: session, status } = useSession();
    const router = useRouter();

    // useEffect를 사용하여 status 값의 변화에 따라 적절한 동작을 수행합니다.
    useEffect(() => {
        // 로딩 중이 아닐 때, 그리고 로그인이 되어있지 않을 때
        if (status === "unauthenticated") {
            // /login 페이지로 리디렉션합니다.
            router.push("/login");
        }
    }, [status, router]);

    // 세션 상태를 확인 중일 때 로딩 메시지를 표시합니다.
    if (status === "loading") {
        return <div>로딩 중...</div>;
    }

    // 로그인이 되어 있는 상태일 때 환영 메시지와 로그아웃 버튼을 표시합니다.
    if (status === "authenticated") {
        return (
            <ThemeProvider theme={theme}>
                <h1>환영합니다, {session.user?.name || session.user?.email}님!</h1>
                <button onClick={() => signOut()}>로그아웃</button>
            </ThemeProvider>
        );
    }

    // unauthenticated 상태일 때 리디렉션이 일어나기 전까지는 아무것도 표시하지 않습니다.
    return null;
}
