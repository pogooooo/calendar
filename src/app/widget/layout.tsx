"use client";

import { useEffect } from "react";
import { DialogProvider } from "@/components/dialog/DialogProvider";

// 본 창에서 바꾼 설정(언어·테마·밝기·글꼴·시간대)은 useSettingStore 가 저장소에서 다시 읽어 따라간다.
// 여기서 setLocale 로 받으면 위젯의 낡은 설정 전체가 저장소에 되써져 본 창의 변경이 지워졌다.
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.setProperty("background", "transparent", "important");
        html.style.setProperty("background-color", "transparent", "important");
        body.style.setProperty("background", "transparent", "important");
        body.style.setProperty("background-color", "transparent", "important");
    }, []);

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
