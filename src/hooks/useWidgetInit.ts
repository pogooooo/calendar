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

    const accessToken = useAuthStore((s) => s.accessToken);
    const authFetch   = useAuthFetch();

    const fetchTodos      = useTodoStore((s) => s.fetchTodos);
    const fetchCategories = useCategoryStore((s) => s.fetchCategories);
    const fetchProjects   = useProjectStore((s) => s.fetchProjects);
    const fetchChallenges = useChallengeStore((s) => s.fetchChallenges);
    const fetchAnniversaries = useAnniversaryStore((s) => s.fetchAnniversaries);

    const needKey = need.join(",");

    useEffect(() => {
        if (accessToken) { setAuthed(true); return; }

        refreshSession().then((token) => {
            if (token) setAuthed(true);
        });
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
        if (wanted.includes("anniversaries")) jobs.push(fetchAnniversaries(authFetch));

        Promise.all(jobs).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed, needKey]);

    return { ready, authed };
}
