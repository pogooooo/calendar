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
    const timer = React.useRef<number | null>(null);
    // 일간 화면이 다른 날을 보면 store 의 memo 가 그날 것으로 바뀐다. 오늘 것만 기억해 둔다.
    const todayMemo = React.useRef("");

    React.useEffect(() => {
        if (!isMobileShell()) return;
        const id = window.setInterval(() => setTick((n) => n + 1), 5 * 60 * 1000);
        return () => window.clearInterval(id);
    }, []);

    React.useEffect(() => {
        if (!isMobileShell()) return;
        if (memoDate === localDateKey(new Date())) todayMemo.current = memo;
        // 연달아 바뀌면 마지막 것만 쓴다
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(async () => {
            timer.current = null;
            try {
                const snapshot = buildWidgetSnapshot({
                    todos, categories, challenges, anniversaries, projects,
                    memo: todayMemo.current, t, locale,
                    theme: { family: theme.family, mode: theme.mode, colors: theme.colors },
                });
                const { invoke } = await import("@tauri-apps/api/core");
                await invoke("save_widget_snapshot", { snapshot: JSON.stringify(snapshot) });
            } catch (err) {
                console.warn("[widget] 스냅샷을 쓰지 못했다", err);
            }
        }, 400);
        return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
    }, [todos, categories, challenges, anniversaries, projects, memo, memoDate, t, locale, theme, tick]);

    // 위젯에서 열었을 때 갈 곳
    React.useEffect(() => {
        if (!isMobileShell()) return;
        let stopped = false;
        const consume = async () => {
            try {
                const { invoke } = await import("@tauri-apps/api/core");
                const link = await invoke<string | null>("take_pending_link");
                if (stopped || !link) return;
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
        return () => { stopped = true; document.removeEventListener("visibilitychange", onVisible); };
    }, [router]);

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
