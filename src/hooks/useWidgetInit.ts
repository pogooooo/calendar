"use client";

import { useEffect, useState } from "react";
import { bustFetchCache } from "@/lib/fetchOnce";
import useAuthStore from "@/store/useAuthStore";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch, refreshSession, isTokenExpired } from "@/hooks/useAuthFetch";
import { subscribeDataChange, type DataKind } from "@/lib/dataSync";

/**
 * 위젯이 보여 주는 자료 — 처음 읽기와 "다른 창이 바꿨다" 신호에 다시 읽기를 함께 정한다.
 * daily(오늘 메모·간단 할 일)는 처음 읽기를 패널이 그날 날짜로 하고, 여기서는 다시 읽기만 한다.
 * 예전에는 메모·빠른 할 일·챌린지 위젯이 [] 를 넘겨, 본 창에서 바꾼 것이 창을 다시 열 때까지 안 보였다
 * (옛 메모를 보고 고치면 본 창에서 쓴 새 메모를 덮어썼다).
 */
export type WidgetData = "todos" | "categories" | "projects" | "challenges" | "anniversaries" | "daily";

const ALL: WidgetData[] = ["todos", "categories", "projects", "challenges", "anniversaries"];

export function useWidgetInit(need: WidgetData[] = ALL) {
    const [ready, setReady]   = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    // 스토어에서 파생시켜야 다른 창에서 로그인/로그아웃한 결과가 이 창에도 반영된다
    const accessToken = useAuthStore((s) => s.accessToken);
    const authed = !!accessToken;

    const authFetch   = useAuthFetch();

    const fetchTodos      = useTodoStore((s) => s.fetchTodos);
    const fetchCategories = useCategoryStore((s) => s.fetchCategories);
    const fetchProjects   = useProjectStore((s) => s.fetchProjects);
    const fetchChallenges = useChallengeStore((s) => s.fetchChallenges);
    const fetchAnniversaries = useAnniversaryStore((s) => s.fetchAnniversaries);

    const needKey = need.join(",");

    // 부팅 직후에는 네트워크가 아직 안 올라와 있을 수 있다.
    // 한 번 실패했다고 포기하면 위젯이 창을 닫을 때까지 로그인 화면에 머문다.
    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let attempt = 0;

        const attemptAuth = async () => {
            if (cancelled) return;

            const current = useAuthStore.getState().accessToken;
            if (current && !isTokenExpired(current)) {
                setAuthChecked(true);
                return;
            }

            const result = await refreshSession();
            if (cancelled) return;

            setAuthChecked(true);

            if (result.ok) return;
            // 서버가 거부한 토큰은 다시 시도해도 소용없다
            if (result.reason === "invalid") return;

            attempt += 1;
            const delay = Math.min(30000, 2000 * 2 ** (attempt - 1));
            timer = setTimeout(attemptAuth, delay);
        };

        const retryNow = () => {
            attempt = 0;
            clearTimeout(timer);
            attemptAuth();
        };

        attemptAuth();
        window.addEventListener("online", retryNow);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            window.removeEventListener("online", retryNow);
        };
     
    }, []);

    useEffect(() => {
        // 인증에 실패해도 ready 를 올려야 위젯이 '로딩 중...'에 영구히 갇히지 않는다
        if (!authed) {
            if (authChecked) setReady(true);
            return;
        }

        const wanted = needKey ? needKey.split(",") as WidgetData[] : [];
        const jobs: Promise<unknown>[] = [];

        if (wanted.includes("todos")) jobs.push(fetchTodos(authFetch));
        if (wanted.includes("categories")) jobs.push(fetchCategories(authFetch));
        if (wanted.includes("projects")) jobs.push(fetchProjects(authFetch));
        if (wanted.includes("challenges")) jobs.push(fetchChallenges(authFetch));
        if (wanted.includes("anniversaries")) jobs.push(fetchAnniversaries(authFetch));

        Promise.all(jobs).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed, authChecked, needKey]);

    /**
     * 다른 창이 자료를 바꾸면 다시 받아 온다.
     * 이게 없으면 오늘 할 일 위젯에서 일정을 넣어도 월간 달력 위젯은
     * 창을 다시 열 때까지 옛 화면 그대로다.
     */
    useEffect(() => {
        if (!authed) return;
        const wanted = needKey ? (needKey.split(",") as WidgetData[]) : [];

        // 한 번의 저장이 여러 신호를 낼 수 있어 짧게 묶어서 한 번만 받아 온다.
        let timer: ReturnType<typeof setTimeout> | undefined;
        const pending = new Set<DataKind>();

        const flush = () => {
            const kinds = new Set(pending);
            pending.clear();
            // 다른 창이 바꾼 것이다 — 방금 읽었더라도 다시 읽어야 한다
            bustFetchCache();
            if (kinds.has("todos") && wanted.includes("todos")) fetchTodos(authFetch);
            if (kinds.has("categories") && wanted.includes("categories")) fetchCategories(authFetch);
            if (kinds.has("projects") && wanted.includes("projects")) fetchProjects(authFetch);
            if (kinds.has("challenges") && wanted.includes("challenges")) fetchChallenges(authFetch);
            if (kinds.has("anniversaries") && wanted.includes("anniversaries")) fetchAnniversaries(authFetch);
            if (kinds.has("daily") && wanted.includes("daily")) useDailyStore.getState().fetchDailyData(authFetch);
        };

        const stop = subscribeDataChange((kind) => {
            pending.add(kind);
            clearTimeout(timer);
            timer = setTimeout(flush, 180);
        });

        // 다른 기기(폰·웹)에서 바꾼 것은 신호가 오지 않는다. 부팅 때 망보다 먼저 뜬 위젯은 첫 읽기가 실패한 채
        // 빈 목록으로 남았다 — 망이 돌아오면, 그리고 10분마다 다시 읽는다
        const refreshAll = () => {
            (["todos", "categories", "projects", "challenges", "anniversaries", "daily"] as DataKind[]).forEach((k) => pending.add(k));
            clearTimeout(timer);
            timer = setTimeout(flush, 180);
        };
        window.addEventListener("online", refreshAll);
        const every = window.setInterval(refreshAll, 10 * 60 * 1000);

        return () => {
            stop();
            clearTimeout(timer);
            window.removeEventListener("online", refreshAll);
            window.clearInterval(every);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed, needKey]);

    return { ready, authed, authChecked };
}
