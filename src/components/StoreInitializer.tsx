"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useAuthStore from "@/store/useAuthStore";
import useDailyStore from "@/store/useDailyStore";
import useSettingStore from "@/store/useSettingStore";

const PUBLIC_ROUTES = ["/signIn", "/signUp", "/download"];
const NO_PREFETCH_ROUTES = PUBLIC_ROUTES;

const normalizePath = (pathname: string) =>
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
    const authFetch = useAuthFetch();
    const router = useRouter();
    const pathname = usePathname();

    const fetchTodos = useTodoStore((state) => state.fetchTodos);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const fetchDailyData = useDailyStore((state) => state.fetchDailyData);
    const fetchSettings = useSettingStore((state) => state.fetchSettings);

    const accessToken = useAuthStore((state) => state.accessToken);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !accessToken) return;
        // 위젯은 자기 데이터만 받고, 공개 페이지는 앱 데이터가 필요 없다.
        if (pathname.startsWith("/widget")) return;
        if (NO_PREFETCH_ROUTES.includes(normalizePath(pathname))) return;

        Promise.all([
            fetchSettings(authFetch),
            fetchCategories(authFetch),
            fetchTodos(authFetch),
            fetchDailyData(authFetch, new Date())
        ]);
    }, [isMounted, accessToken, pathname, authFetch, fetchTodos, fetchCategories]);

    useEffect(() => {
        if (!isMounted) return;

        const normalized = normalizePath(pathname);
        const isPublicRoute = PUBLIC_ROUTES.includes(normalized);
        const isLandingRoute = normalized === "/download";
        const isWidgetRoute = pathname.startsWith("/widget");

        // 위젯 창은 자체 인증 처리 — 리디렉션 없음
        if (isWidgetRoute) return;

        if (!accessToken && !isPublicRoute) {
            router.replace("/signIn");
        }

        if (accessToken && isPublicRoute && !isLandingRoute) {
            router.replace("/");
        }
    }, [isMounted, accessToken, pathname, router]);

    if (!isMounted) return null;

    return <>{children}</>;
}