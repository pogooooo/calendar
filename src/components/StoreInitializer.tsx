"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthFetch } from "@/hooks/AuthFetch";
import useTodoStore from "@/store/todo/useTodoStore";
import useCategoryStore from "@/store/category/useCategoryStore";
import useAuthStore from "@/store/auth/useAuthStore";

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
    const authFetch = useAuthFetch();
    const router = useRouter();
    const pathname = usePathname();

    const fetchTodos = useTodoStore((state) => state.fetchTodos);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const accessToken = useAuthStore((state) => state.accessToken);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && accessToken) {
            Promise.all([
                fetchCategories(authFetch),
                fetchTodos(authFetch)
            ]);
        }
    }, [isMounted, accessToken, authFetch, fetchTodos, fetchCategories]);

    useEffect(() => {
        if (!isMounted) return;

        const publicRoutes = ["/signIn", "/signup"];
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