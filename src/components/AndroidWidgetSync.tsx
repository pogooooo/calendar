"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useChallengeStore from "@/store/useChallengeStore";
import { useT } from "@/i18n/useT";
import { isMobileShell } from "@/lib/platform";
import { buildWidgetSnapshot } from "@/lib/widgetSnapshot";

/**
 * 안드로이드 홈 위젯의 재료를 파일로 내보낸다.
 *
 * 자료(할 일·카테고리·챌린지)나 언어가 바뀔 때마다, 그리고 5분마다(시각이 흘러
 * "지금/다음" 이 바뀌므로) 스냅샷을 다시 쓴다. 파일이 바뀌면 MainActivity 의
 * FileObserver 가 위젯을 다시 그리게 한다. 폰 앱(Tauri + Android)에서만 돈다.
 */
export default function AndroidWidgetSync() {
    const todos = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);
    const challenges = useChallengeStore((s) => s.challenges);
    const t = useT();
    const theme = useTheme();
    const [tick, setTick] = React.useState(0);
    const timer = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (!isMobileShell()) return;
        const id = window.setInterval(() => setTick((n) => n + 1), 5 * 60 * 1000);
        return () => window.clearInterval(id);
    }, []);

    React.useEffect(() => {
        if (!isMobileShell()) return;
        // 연달아 바뀌면 마지막 것만 쓴다
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(async () => {
            timer.current = null;
            try {
                const snapshot = buildWidgetSnapshot(todos, categories, challenges, t, theme.colors.primary);
                const { invoke } = await import("@tauri-apps/api/core");
                await invoke("save_widget_snapshot", { snapshot: JSON.stringify(snapshot) });
            } catch (err) {
                console.warn("[widget] 스냅샷을 쓰지 못했다", err);
            }
        }, 400);
        return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
    }, [todos, categories, challenges, t, theme.colors.primary, tick]);

    return null;
}
