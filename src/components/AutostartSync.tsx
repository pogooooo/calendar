"use client";

import React from "react";
import useSettingStore from "@/store/useSettingStore";

export default function AutostartSync() {
    const autostart = useSettingStore((s) => s.autostart);
    React.useEffect(() => {
        if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return;
        import("@tauri-apps/api/core").then(({ invoke }) => {
            invoke("set_autostart", { enabled: autostart }).catch(() => {});
        });
    }, [autostart]);
    return null;
}
