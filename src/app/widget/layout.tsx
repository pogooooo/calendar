"use client";

import { useEffect } from "react";
import useSettingStore from "@/store/useSettingStore";
import type { Locale } from "@/i18n/types";

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
    const setLocale = useSettingStore((s) => s.setLocale);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.setProperty("background", "transparent", "important");
        html.style.setProperty("background-color", "transparent", "important");
        body.style.setProperty("background", "transparent", "important");
        body.style.setProperty("background-color", "transparent", "important");
    }, []);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key !== "setting-store" || !e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                const locale = parsed?.state?.locale as Locale | undefined;
                if (locale) setLocale(locale);
            } catch {}
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [setLocale]);

    return (
        <div
            style={{
                background: "transparent",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
}
