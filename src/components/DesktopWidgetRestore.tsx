"use client";

import React from "react";

export default function DesktopWidgetRestore() {
    React.useEffect(() => {
        if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return;
        if (window.location.pathname.startsWith("/widget")) return;
        if (sessionStorage.getItem("cronos-widgets-restored")) return;
        sessionStorage.setItem("cronos-widgets-restored", "1");

        import("@tauri-apps/api/core").then(({ invoke }) => {
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
