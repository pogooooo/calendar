"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthFetch, refreshSession } from "@/hooks/useAuthFetch";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useAuthStore from "@/store/useAuthStore";
import useDailyStore from "@/store/useDailyStore";
import useSettingStore from "@/store/useSettingStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import { isDesktopApp } from "@/lib/apiBase";
import { subscribeDataChange, type DataKind } from "@/lib/dataSync";
import { getRemember, isFreshLaunch } from "@/lib/session";
import { bustFetchCache } from "@/lib/fetchOnce";

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
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const fetchChallenges = useChallengeStore((state) => state.fetchChallenges);

    const accessToken = useAuthStore((state) => state.accessToken);
    const [isMounted, setIsMounted] = useState(false);
    // "로그인 유지" 판정이 끝나기 전에는 자료도 안 받고 어디로도 보내지 않는다
    const [sessionSettled, setSessionSettled] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * 켤 때 한 번, "로그인 유지" 를 끈 세션을 정리한다 (src/lib/session.ts).
     *   - 데스크톱·안드로이드: 프로세스가 새로 켜졌으면 세션을 버린다 (서버 토큰도 지운다 —
     *     그래야 같이 뜬 위젯 창이 옛 토큰으로 갱신해 되살아나지 못한다)
     *   - 웹: 유지를 끈 탭은 sessionStorage 라 새 탭에는 토큰이 없다. 세션 쿠키는 살아 있을 수
     *     있으니 한 번 갱신해 본다. 안 되면 그대로 로그인 화면으로
     * 위젯 창은 제 인증 처리를 갖고 있어 건드리지 않는다.
     */
    useEffect(() => {
        if (!isMounted) return;
        if (pathname.startsWith("/widget")) { setSessionSettled(true); return; }
        let cancelled = false;
        (async () => {
            const { accessToken: token, logout } = useAuthStore.getState();
            if (isDesktopApp()) {
                // 늘 부른다 — 이번 프로세스의 id 를 적어 두어야, 창을 다시 읽을 때 "새로 켠 것" 으로 오해하지 않는다
                const fresh = await isFreshLaunch();
                if (fresh && token && !getRemember()) await logout();
            } else if (!token && !getRemember()) {
                await refreshSession();
            }
            if (!cancelled) setSessionSettled(true);
        })();
        return () => { cancelled = true; };
    // 켤 때 한 번이면 된다. pathname 이 바뀔 때마다 돌리면 위젯 창 밖에서 두 번 판정한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted || !sessionSettled || !accessToken) return;
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
    }, [isMounted, sessionSettled, accessToken, pathname, authFetch, fetchTodos, fetchCategories, fetchSettings, fetchDailyData, fetchAnniversaries]);

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
            // 다른 창이 바꾼 것이다 — 방금 읽었더라도 다시 읽어야 한다
            bustFetchCache();
            if (kinds.has("todos")) fetchTodos(authFetch);
            if (kinds.has("categories")) fetchCategories(authFetch);
            if (kinds.has("anniversaries")) fetchAnniversaries(authFetch);
            // 위젯 창에서 프로젝트·챌린지를 바꿔도 본 창 달력이 따라오게 (예전엔 이 둘을 안 받아서 다시 열 때까지 옛것이었다)
            if (kinds.has("projects")) fetchProjects(authFetch);
            if (kinds.has("challenges")) fetchChallenges(authFetch);
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
        if (!isMounted || !sessionSettled) return;

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
    }, [isMounted, sessionSettled, accessToken, pathname, router]);

    if (!isMounted || !sessionSettled) return null;

    return <>{children}</>;
}