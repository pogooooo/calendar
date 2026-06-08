"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useWidgetInit() {
    const [ready, setReady]   = useState(false);
    const [authed, setAuthed] = useState(false);

    const accessToken    = useAuthStore((s) => s.accessToken);
    const setAccessToken = useAuthStore((s) => s.setAccessToken);
    const setUser        = useAuthStore((s) => s.setUser);
    const authFetch      = useAuthFetch();

    const fetchTodos      = useTodoStore((s) => s.fetchTodos);
    const fetchCategories = useCategoryStore((s) => s.fetchCategories);
    const fetchProjects   = useProjectStore((s) => s.fetchProjects);
    const fetchChallenges = useChallengeStore((s) => s.fetchChallenges);

    // 1) 액세스 토큰 없으면 refresh
    useEffect(() => {
        if (accessToken) { setAuthed(true); return; }

        fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    if (data.user) setUser(data.user);
                    setAuthed(true);
                }
            })
            .catch(() => {})
            .finally(() => {
                // authed가 설정될 때까지 ready는 false 유지
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2) 인증 후 데이터 패치
    useEffect(() => {
        if (!authed) return;
        Promise.all([
            fetchTodos(authFetch),
            fetchCategories(authFetch),
            fetchProjects(authFetch),
            fetchChallenges(authFetch),
        ]).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed]);

    return { ready, authed };
}
