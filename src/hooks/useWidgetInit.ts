"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { useAuthFetch, refreshSession } from "@/hooks/useAuthFetch";

export type WidgetData = "todos" | "categories" | "projects" | "challenges" | "anniversaries";

const ALL: WidgetData[] = ["todos", "categories", "projects", "challenges", "anniversaries"];

export function useWidgetInit(need: WidgetData[] = ALL) {
    const [ready, setReady]   = useState(false);
    const [authed, setAuthed] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

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

            if (useAuthStore.getState().accessToken) {
                setAuthed(true);
                setAuthChecked(true);
                return;
            }

            const result = await refreshSession();
            if (cancelled) return;

            setAuthChecked(true);

            if (result.ok) {
                setAuthed(true);
                return;
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return { ready, authed, authChecked };
}
