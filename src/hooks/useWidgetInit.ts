"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { api, clientHeaders } from "@/lib/apiBase";

export type WidgetData = "todos" | "categories" | "projects" | "challenges";

const ALL: WidgetData[] = ["todos", "categories", "projects", "challenges"];

export function useWidgetInit(need: WidgetData[] = ALL) {
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

    const needKey = need.join(",");

    useEffect(() => {
        if (accessToken) { setAuthed(true); return; }

        const stored = useAuthStore.getState().refreshToken;

        fetch(api("/api/auth/refresh"), {
            method: "POST",
            headers: {
                ...clientHeaders(),
                ...(stored ? { "X-Refresh-Token": stored } : {}),
            },
        })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    if (data.user) setUser(data.user);
                    setAuthed(true);
                }
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!authed) return;

        const wanted = needKey ? needKey.split(",") as WidgetData[] : [];
        const jobs: Promise<unknown>[] = [];

        if (wanted.includes("todos")) jobs.push(fetchTodos(authFetch));
        if (wanted.includes("categories")) jobs.push(fetchCategories(authFetch));
        if (wanted.includes("projects")) jobs.push(fetchProjects(authFetch));
        if (wanted.includes("challenges")) jobs.push(fetchChallenges(authFetch));

        Promise.all(jobs).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed, needKey]);

    return { ready, authed };
}
