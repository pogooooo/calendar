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

// /privacy 는 구글 플레이가 여는 개인정보처리방침 — 빠져 있어 로그아웃한 사람은 /download 로 튕겼다
// /verifyEmail 은 가입 인증 메일의 링크 — 로그인 전에 열린다
const PUBLIC_ROUTES = ["/signIn", "/signUp", "/download", "/forgotPassword", "/resetPassword", "/privacy", "/verifyEmail"];
const NO_PREFETCH_ROUTES = PUBLIC_ROUTES;

/**
 * 로그인한 상태로 들어와도 "/" 로 되돌리지 않는 공개 경로.
 * - /download : 소개·다운로드 랜딩
 * - /resetPassword : 다른 기기에 세션이 남아 있어도 메일 링크는 열려야 한다.
 * - /privacy : 로그인한 채로도 읽을 수 있어야 한다.
 * - /verifyEmail : 다른 계정으로 로그인한 기기에서 열어도 인증은 끝나야 한다.
 */
const STAY_WHEN_AUTHED = ["/download", "/resetPassword", "/privacy", "/verifyEmail"];

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
     * 계정이 바뀌면(로그아웃·다른 계정으로 로그인·다른 창에서 바뀜) 앞 사람의 자료를 비운다.
     * 자료 스토어는 메모리에만 있어 페이지를 다시 읽지 않으면 남는다 — 로그아웃하고 다른 계정으로 들어오면
     * 새 자료가 올 때까지 앞 사람의 프로젝트가 홈에 보였다. "방금 읽었다" 는 기억도 지워 새 계정의 읽기가 건너뛰어지지 않게.
     */
    useEffect(() => useAuthStore.subscribe((s, prev) => {
        const before = prev.user?.id ?? null;
        if (!before || before === (s.user?.id ?? null)) return;
        const reset = <T,>(store: { setState: (v: T, replace: true) => void; getInitialState: () => T }) =>
            store.setState(store.getInitialState(), true);
        reset(useTodoStore);
        reset(useCategoryStore);
        reset(useDailyStore);
        reset(useAnniversaryStore);
        reset(useProjectStore);
        reset(useChallengeStore);
        bustFetchCache();
    }), []);

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
            // 날을 주지 않는다 — 일간이 보는 날이 있으면 그 날, 없으면 오늘. 토큰이 갱신될 때마다 여기가 다시 돌아
            // 일간이 보던 날을 오늘 것으로 갈아 끼웠다
            fetchDailyData(authFetch),
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
            // 오늘이 아니라 이 창이 보고 있는 날을 — 일간이 다른 날을 보는데 오늘 것으로 갈아 끼우면 그 날 머리 밑에 오늘 메모가 뜬다
            if (kinds.has("daily")) fetchDailyData(authFetch);
        };

        const stop = subscribeDataChange((kind) => {
            pending.add(kind);
            clearTimeout(timer);
            timer = setTimeout(flush, 180);
        });

        return () => { stop(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, accessToken, pathname]);

    /**
     * 연결이 돌아오거나, 뒤로 숨었던 앱이 1분 넘게 지나 다시 보이면 자료를 다시 받는다.
     * 연결 없이 켜면 읽기가 모두 실패한 채로 남아 화면을 옮기기 전까지 홈이 비어 있었고,
     * 폰 앱을 뒤에 두었다 돌아오면 다른 기기에서 바꾼 것이 보이지 않았다.
     */
    useEffect(() => {
        if (!isMounted || !sessionSettled || !accessToken) return;
        if (pathname.startsWith("/widget")) return;
        if (NO_PREFETCH_ROUTES.includes(normalizePath(pathname))) return;

        const refetch = () => {
            bustFetchCache();
            fetchSettings(authFetch);
            fetchCategories(authFetch);
            fetchTodos(authFetch);
            fetchDailyData(authFetch);
            fetchAnniversaries(authFetch);
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
        };
        let hiddenAt = document.hidden ? Date.now() : 0;
        const onVisibility = () => {
            if (document.hidden) { hiddenAt = Date.now(); return; }
            if (hiddenAt && Date.now() - hiddenAt > 60_000) refetch();
            hiddenAt = 0;
        };
        window.addEventListener("online", refetch);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("online", refetch);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, sessionSettled, accessToken, pathname]);

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