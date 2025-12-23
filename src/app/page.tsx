"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/auth/useAuthStore";

import Main from "@/pages/main/Main"

export default function Home() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user)

    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        console.log(user)
    }, []);

    useEffect(() => {
        if (isMounted && !accessToken) {
            router.push("/signIn");
        }
    }, [isMounted, accessToken, router]);

    if (!isMounted) {
        return <div>로딩 중...</div>;
    }

    return (
        <Main></Main>
    );
}
