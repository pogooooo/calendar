"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useAuthStore from "@/store/useAuthStore";
import useDailyStore from "@/store/useDailyStore";
import useSettingStore from "@/store/useSettingStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { isDesktopApp } from "@/lib/apiBase";
import { subscribeDataChange, type DataKind } from "@/lib/dataSync";

const PUBLIC_ROUTES = ["/signIn", "/signUp", "/download", "/forgotPassword", "/resetPassword"];
const NO_PREFETCH_ROUTES = PUBLIC_ROUTES;

/**
 * 로그인한 상태로 들어와도 "/" 로 되돌리지 않는 공개 경로.
 * - /download : 소개·다운로드 랜딩
 * - /resetPassword : 다른 기기에 세션이 남아 있어도 메일 링크는 열려야 한다.
 */
const STAY_WHEN_AUTHED = ["/download", "/resetPassword"];

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
    const fetchAnniversaries = useAnniversaryStore((state) => state.fetchAnniversaries);

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
            fetchDailyData(authFetch, new Date()),
            fetchAnniversaries(authFetch)
        ]);
    }, [isMounted, accessToken, pathname, authFetch, fetchTodos, fetchCategories, fetchSettings, fetchDailyData, fetchAnniversaries]);

    /**
     * 위젯 창에서 무언가를 바꾸면 본 창도 따라 바뀌어야 한다.
     * (반대 방향은 useWidgetInit 이 맡는다)
     */
    useEffect(() => {
        if (!isMounted || !accessToken) return;
        if (pathname.startsWith("/widget")) return;

        let timer: ReturnType<typeof setTimeout> | undefined;
        const pending = new Set<DataKind>();

        const flush = () => {
            const kinds = new Set(pending);
            pending.clear();
            if (kinds.has("todos")) fetchTodos(authFetch);
            if (kinds.has("categories")) fetchCategories(authFetch);
            if (kinds.has("anniversaries")) fetchAnniversaries(authFetch);
            if (kinds.has("daily")) fetchDailyData(authFetch, new Date());
        };

        const stop = subscribeDataChange((kind) => {
            pending.add(kind);
            clearTimeout(timer);
            timer = setTimeout(flush, 180);
        });

        return () => { stop(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, accessToken, pathname]);

    useEffect(() => {
        if (!isMounted) return;

        const normalized = normalizePath(pathname);
        const isPublicRoute = PUBLIC_ROUTES.includes(normalized);
        const stayWhenAuthed = STAY_WHEN_AUTHED.includes(normalized);
        const isWidgetRoute = pathname.startsWith("/widget");

        // 위젯 창은 자체 인증 처리 — 리디렉션 없음
        if (isWidgetRoute) return;

        if (!accessToken && !isPublicRoute) {
            router.replace(isDesktopApp() ? "/signIn" : "/download");
        }

        if (accessToken && isPublicRoute && !stayWhenAuthed) {
            router.replace("/");
        }
    }, [isMounted, accessToken, pathname, router]);

    if (!isMounted) return null;

    return <>{children}</>;
}