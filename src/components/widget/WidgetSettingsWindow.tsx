"use client";

import { useCallback, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSearchParams } from "next/navigation";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { useWidgetMeta } from "@/hooks/useWidgetMeta";
import { useT } from "@/i18n/useT";
import { isDesktopShell } from "@/lib/platform";
import { isWidgetKind, type WidgetKind } from "@/lib/widgetKinds";
import type { WidgetPreviewSize } from "@/hooks/useWidgetPreviewDesktop";
import { SettingsWindow } from "./WidgetAppearance.styles";
import WidgetAppearanceSettings from "./WidgetAppearanceSettings";

function WidgetEditor({ kind, size }: { kind: WidgetKind; size?: WidgetPreviewSize }) {
    const { label } = useWidgetMeta()[kind];
    const t = useT();
    useWidgetInit();

    const close = useCallback(() => {
        if (isDesktopShell()) {
            void getCurrentWindow().close().catch(error => console.error("[WIDGET_SETTINGS_CLOSE]", error));
        } else if (window.opener && !window.opener.closed) {
            window.opener.focus();
            window.close();
        } else {
            window.location.replace("/settings");
        }
    }, []);

    useEffect(() => {
        document.title = `CRONOS · ${label} · ${t.widgetShell.appearance}`;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
            event.preventDefault();
            close();
        };
        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, [close, label, t.widgetShell.appearance]);

    return <SettingsWindow aria-label={`${label} · ${t.widgetShell.appearance}`}>
        <WidgetAppearanceSettings kind={kind} size={size} onDone={close} />
    </SettingsWindow>;
}

export default function WidgetSettingsWindow() {
    const query = useSearchParams();
    const kind = query.get("kind");
    const width = Number(query.get("w"));
    const height = Number(query.get("h"));
    const size = width >= 160 && width <= 8192 && height >= 120 && height <= 8192 ? { width, height } : undefined;

    return <WidgetEditor key={kind} kind={isWidgetKind(kind) ? kind : "today"} size={size} />;
}
