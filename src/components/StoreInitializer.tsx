"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useAuthStore from "@/store/useAuthStore";
import useDailyStore from "@/store/useDailyStore";
import useSettingStore from "@/store/useSettingStore";

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
        if (isMounted && accessToken) {
            Promise.all([
                fetchSettings(authFetch),
                fetchCategories(authFetch),
                fetchTodos(authFetch),
                fetchDailyData(authFetch, new Date())
            ]);
        }
    }, [isMounted, accessToken, authFetch, fetchTodos, fetchCategories]);

    useEffect(() => {
        if (!isMounted) return;

        const publicRoutes = ["/signIn", "/signUp"];
        const isPublicRoute = publicRoutes.includes(pathname);

        if (!accessToken && !isPublicRoute) {
            router.replace("/signIn");
        }

        if (accessToken && isPublicRoute) {
            router.replace("/");
        }
    }, [isMounted, accessToken, pathname, router]);

    if (!isMounted) return null;

    return <>{children}</>;
}