"use client";

import { invoke } from "@tauri-apps/api/core";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import { isDesktopShell } from "@/lib/platform";
import type { WidgetKind } from "@/lib/widgetKinds";

export default function useWidgetAppearanceWindow() {
    const dialog = useDialog();
    const t = useT();

    return async (kind: WidgetKind, fromWidget = false) => {
        if (isDesktopShell()) {
            try {
                await invoke("open_widget_settings", { kind });
            } catch (error) {
                console.error("[WIDGET_SETTINGS_OPEN]", error);
                await dialog.notify({ title: t.widgetShell.appearance, message: t.widget.openFailed });
            }
            return;
        }

        const params = new URLSearchParams({ kind });
        if (fromWidget) {
            params.set("w", String(window.innerWidth));
            params.set("h", String(window.innerHeight));
        }
        const tab = window.open(`/widget-settings/?${params}`, `cronos-widget-settings-${kind}`);
        if (tab) tab.focus();
        else await dialog.notify({ title: t.widgetShell.appearance, message: t.widget.popupBlocked });
    };
}
