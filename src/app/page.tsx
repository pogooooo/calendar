"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { themes } from "@/styles/theme";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);

    const router = useRouter();

    const [theme, setTheme] = useState(themes.celestial);
    const toggleTheme = () => {
        setTheme(prev => prev.name === 'celestial' ? themes.light : themes.celestial);
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
        } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUserInfo(parsedUser);
                } catch (e) {
                    console.error("User info parsing error", e);
                }
            }
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            router.push("/login");
        }
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <h1>환영합니다, {userInfo?.name || userInfo?.email || "사용자"}님!</h1>
            <button onClick={handleLogout}>로그아웃</button>
        </ThemeProvider>
    );
}
