"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { useRouter } from "next/navigation";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useChallengeStore from "@/store/useChallengeStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import useProjectStore from "@/store/useProjectStore";
import useDailyStore from "@/store/useDailyStore";
import useSettingStore from "@/store/useSettingStore";
import { useT } from "@/i18n/useT";
import { isMobileShell } from "@/lib/platform";
import { localDateKey } from "@/lib/dateKey";
import { buildWidgetSnapshot } from "@/lib/widgetSnapshot";
import useAuthStore from "@/store/useAuthStore";
import { useAuthFetch, isTokenExpired } from "@/hooks/useAuthFetch";
import { API_BASE } from "@/lib/apiBase";
import { bustFetchCache } from "@/lib/fetchOnce";

const WIDGET_KEY = "cronos-widget-key";
/** 이번 실행에서 이미 새로 받았다는 표 — 앱을 새로 켤 때마다 한 번은 새로 받는다 */
const WIDGET_KEY_FRESH = "cronos-widget-key-fresh";
/** 남은 수명이 이보다 짧으면 새로 받는다 (열쇠는 30일) */
const RENEW_BEFORE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 위젯 전용 열쇠(할 일 넣기만 되는 것)를 받아 둔다. 앱을 켤 때마다 한 번 새로 받는다 — 비밀번호가 바뀌면 서버가
 * 옛 열쇠를 받지 않으므로(판 번호, src/lib/jwt.ts) 켤 때 받아 두어야 위젯이 다시 듣는다. 못 받으면 있던 것을 그대로 쓴다.
 * 로그아웃하면 지운다 — 위젯 재료에서도 빠져, 위젯을 누르면 앱이 열린다.
 */
function useWidgetKey(): string | null {
    const userId = useAuthStore((s) => s.user?.id ?? null);
    const authFetch = useAuthFetch();
    const [key, setKey] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isMobileShell()) return;
        if (!userId) {
            setKey(null);
            try { localStorage.removeItem(WIDGET_KEY); } catch {}
            return;
        }
        let cancelled = false;
        try {
            const saved = JSON.parse(localStorage.getItem(WIDGET_KEY) ?? "null") as { userId?: string; token?: string } | null;
            const usable = saved?.userId === userId && saved.token && !isTokenExpired(saved.token, RENEW_BEFORE_MS);
            if (usable && sessionStorage.getItem(WIDGET_KEY_FRESH) === userId) {
                setKey(saved!.token!);
                return;
            }
            // 이번 실행에서 처음 — 아래에서 새로 받는 동안(또는 못 받으면) 있던 것을 쓴다
            if (usable) setKey(saved!.token!);
        } catch {}
        (async () => {
            try {
                const res = await authFetch("/api/widget/token", { method: "POST" });
                if (!res.ok) return;
                const { token } = await res.json() as { token?: string };
                if (cancelled || !token) return;
                try {
                    localStorage.setItem(WIDGET_KEY, JSON.stringify({ userId, token }));
                    sessionStorage.setItem(WIDGET_KEY_FRESH, userId);
                } catch {}
                setKey(token);
            } catch { /* 다음에 열 때 다시 */ }
        })();
        return () => { cancelled = true; };
    }, [userId, authFetch]);

    return key;
}

/**
 * 안드로이드 홈 위젯의 재료를 파일로 내보내고, 위젯에서 앱을 열었을 때 그 자리로 보낸다.
 *
 * 내보내기: 자료(할 일·카테고리·챌린지·기념일·프로젝트·메모)나 언어·테마가 바뀔 때마다,
 * 그리고 5분마다 스냅샷을 다시 쓴다. 파일이 바뀌면 MainActivity 의 FileObserver 가
 * 위젯을 다시 그리게 한다.
 *
 * 딥링크: 위젯의 PendingIntent 는 `cronos://…` 를 MainActivity 에 보내고, MainActivity 는
 * 그걸 `pending-link.txt` 에 적어 둔다 (Kotlin → JS 로 바로 부를 길이 없어 파일로 건넨다).
 * 여기서는 켤 때와 화면이 다시 보일 때 그 파일을 가져와(take_pending_link) 길을 옮긴다.
 *
 * 폰 앱(Tauri + Android)에서만 돈다.
 */
export default function AndroidWidgetSync() {
    const todos = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);
    const challenges = useChallengeStore((s) => s.challenges);
    const anniversaries = useAnniversaryStore((s) => s.anniversaries);
    const projects = useProjectStore((s) => s.projects);
    const memo = useDailyStore((s) => s.memo);
    const memoDate = useDailyStore((s) => s.memoDate);
    const locale = useSettingStore((s) => s.locale);
    const t = useT();
    const theme = useTheme();
    const router = useRouter();
    const [tick, setTick] = React.useState(0);
    const widgetKey = useWidgetKey();
    const authFetch = useAuthFetch();
    const timer = React.useRef<number | null>(null);
    // 일간 화면이 다른 날을 보면 store 의 memo 가 그날 것으로 바뀐다. 오늘 것만 기억해 둔다.
    const todayMemo = React.useRef("");
    const userId = useAuthStore((s) => s.user?.id ?? null);
    // 할 일을 한 번이라도 받아 왔는가 (받으면 처음의 빈 배열이 새 배열로 바뀐다).
    // 받기 전의 빈 목록으로 쓰면 켤 때마다 홈 위젯이 잠깐 비고, 오프라인으로 켜면 그대로 빈 채로 남았다
    const todosLoaded = todos !== useTodoStore.getInitialState().todos;

    React.useEffect(() => {
        if (!isMobileShell()) return;
        const id = window.setInterval(() => setTick((n) => n + 1), 5 * 60 * 1000);
        return () => window.clearInterval(id);
    }, []);

    React.useEffect(() => {
        if (!isMobileShell()) return;
        // 연달아 바뀌면 마지막 것만 쓴다
        if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; }
        // 로그아웃하면 곧바로 비운다 (Kotlin 은 읽지 못한 재료를 "없음" 으로 그리고, 누르면 앱을 연다).
        // 기다렸다 쓰면 그사이 로그인 화면으로 넘어가며 이 컴포넌트가 내려가, 지난 사용자의 일정·메모와
        // 빠른 추가 열쇠가 홈 위젯에 그대로 남았다
        if (!userId) {
            todayMemo.current = "";
            void import("@tauri-apps/api/core")
                .then(({ invoke }) => invoke("save_widget_snapshot", { snapshot: "" }))
                .catch(() => {});
            return;
        }
        if (!todosLoaded) return;
        if (memoDate === localDateKey(new Date())) todayMemo.current = memo;
        timer.current = window.setTimeout(async () => {
            timer.current = null;
            try {
                const snapshot = buildWidgetSnapshot({
                    todos, categories, challenges, anniversaries, projects,
                    memo: todayMemo.current, t, locale,
                    theme: { family: theme.family, mode: theme.mode, variant: theme.variant, gemColor: theme.gemColor, colors: theme.colors },
                    quickAdd: widgetKey && API_BASE ? { api: API_BASE, token: widgetKey } : null,
                });
                const { invoke } = await import("@tauri-apps/api/core");
                await invoke("save_widget_snapshot", { snapshot: JSON.stringify(snapshot) });
            } catch (err) {
                console.warn("[widget] 스냅샷을 쓰지 못했다", err);
            }
        }, 400);
        return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
    }, [userId, todosLoaded, todos, categories, challenges, anniversaries, projects, memo, memoDate, t, locale, theme, tick, widgetKey]);

    // 위젯에서 열었을 때 갈 곳
    React.useEffect(() => {
        if (!isMobileShell()) return;
        let stopped = false;
        const consume = async () => {
            try {
                const { invoke } = await import("@tauri-apps/api/core");
                const link = await invoke<string | null>("take_pending_link");
                if (stopped || !link) return;
                // 위젯의 빠른 추가(QuickAddActivity)가 서버에 바로 넣고 남긴 신호 — 길은 그대로, 할 일만 다시 받는다.
                // 안 받으면 뒤에 살아 있던 앱이 옛 목록으로 위젯 재료를 덮어써 방금 넣은 것이 위젯에서 사라진다.
                if (link.startsWith("cronos://refresh")) {
                    // 방금(1.5초 안에) 읽었어도 그건 넣기 전의 목록일 수 있다
                    bustFetchCache("todo:");
                    void useTodoStore.getState().fetchTodos(authFetch);
                    return;
                }
                const path = routeForLink(link);
                if (!path) return;
                router.push(path);
                // 같은 화면에 이미 있으면 mount 가 다시 안 된다 — 화면이 쿼리를 다시 읽게 알린다.
                // push 는 비동기라 location 이 아직 옛것일 수 있어, 갈 곳을 이벤트에 실어 보낸다.
                window.setTimeout(() => window.dispatchEvent(new CustomEvent("cronos-link", { detail: path })), 50);
            } catch {
                /* 데스크톱·웹에는 이 명령이 없다 */
            }
        };
        consume();
        const onVisible = () => { if (document.visibilityState === "visible") consume(); };
        document.addEventListener("visibilitychange", onVisible);
        // 앱이 뒤에 떠 있는 동안 위젯에서 넣은 것도 곧 받아 오게
        const poll = window.setInterval(consume, 60 * 1000);
        return () => { stopped = true; document.removeEventListener("visibilitychange", onVisible); window.clearInterval(poll); };
    }, [router, authFetch]);

    return null;
}

/**
 * `cronos://…` → 앱 안의 길.
 *   cronos://home                    홈
 *   cronos://todo/new                할 일 추가 창
 *   cronos://todo/<id>?date=YYYY-MM-DD   그날의 일간 (그 할 일이 보이는 곳)
 *   cronos://day/YYYY-MM-DD          그날의 일간
 *   cronos://month                   월간
 *   cronos://challenge               챌린지
 *   cronos://anniversary             기념일
 *   cronos://project[/<id>]          프로젝트
 *   cronos://memo                    홈 (메모 칸)
 */
export function routeForLink(link: string): string | null {
    // new URL() 로 풀지 않는다 — 안드로이드 WebView(크로미움 113)는 cronos:// 같은 낯선 스킴의
    // 호스트를 못 읽어 hostname 이 "" 이고 pathname 이 "//anniversary" 로 나온다.
    const m = link.match(/^cronos:\/\/([^/?#]+)(\/[^?#]*)?(?:\?([^#]*))?/);
    if (!m) return null;
    const host = m[1];
    const parts = (m[2] ?? "").split("/").filter(Boolean);
    const date = new URLSearchParams(m[3] ?? "").get("date");
    const dateOk = (d: string | null) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);

    switch (host) {
        case "home": return "/";
        case "memo": return "/";
        case "todo":
            if (parts[0] === "new") return "/calendar?add=1";
            return dateOk(date) ? `/calendar?date=${date}` : "/calendar";
        case "day": return dateOk(parts[0] ?? null) ? `/calendar?date=${parts[0]}` : "/calendar";
        case "month": return "/calendar";
        case "challenge": return "/challenge";
        case "anniversary": return "/anniversary";
        case "project": return "/project";
        default: return "/";
    }
}
