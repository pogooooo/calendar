"use client";

import { useEffect } from "react";
import useSettingStore from "@/store/useSettingStore";
import type { Locale } from "@/i18n/types";
import { DialogProvider } from "@/components/dialog/DialogProvider";

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
    // 개별 필드만 반영한다. 스토어 전체를 되쓰면 위젯이 들고 있던
    // 낡은 스냅샷이 사용자가 방금 바꾼 다른 설정을 되돌려 놓는다.
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
        <DialogProvider>
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
        </DialogProvider>
    );
}
