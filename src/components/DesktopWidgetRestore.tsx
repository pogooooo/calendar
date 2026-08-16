"use client";

import React from "react";
import useSettingStore from "@/store/useSettingStore";
import { hydrateWidgetStateFromFile } from "@/lib/widgetStateFile";

export default function DesktopWidgetRestore() {
    React.useEffect(() => {
        if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return;
        if (window.location.pathname.startsWith("/widget")) return;

        // 이미 등록돼 있으면 건드리지 않는다. 무조건 다시 쓰면 지금 실행 중인
        // 바이너리(예: 개발 빌드)가 사용자의 시작프로그램 등록을 덮어써 버린다.
        if (useSettingStore.getState().autostart) {
            import("@tauri-apps/api/core").then(async ({ invoke }) => {
                try {
                    const enabled = await invoke<boolean>("get_autostart");
                    if (!enabled) await invoke("set_autostart", { enabled: true });
                } catch {}
            });
        }
        if (sessionStorage.getItem("cronos-widgets-restored")) return;
        sessionStorage.setItem("cronos-widgets-restored", "1");

        // 업데이트 등으로 웹뷰 저장소가 비어 있으면 설정 파일에서 복원한다
        hydrateWidgetStateFromFile().then(() => import("@tauri-apps/api/core")).then(({ invoke }) => {
            const prefix = "cronos-widget-open:";
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i) ?? "";
                if (!key.startsWith(prefix) || localStorage.getItem(key) !== "1") continue;

                const kind = key.slice(prefix.length);
                let bounds: { x: number; y: number; w: number; h: number } | null = null;
                try {
                    bounds = JSON.parse(localStorage.getItem(`cronos-widget-bounds:${kind}`) ?? "null");
                } catch {}

                invoke("open_widget", {
                    kind,
                    ...(bounds ? { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h } : {}),
                }).catch(() => {});
            }
        });
    }, []);

    return null;
}
