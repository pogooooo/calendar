"use client";

import { useEffect } from "react";

/* 위젯 전용 레이아웃 — 투명 배경, 사이드바 없음
   루트 layout의 StoreInitializer 리디렉션을 우회하기 위해 별도 경로 유지 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // CSS :has() 선택자에만 의존하지 않고 JS로 직접 설정
        // WebView2가 html/body 배경을 흰색으로 기본 렌더링하면 Acrylic이 가려짐
        const html = document.documentElement;
        const body = document.body;
        html.style.setProperty("background", "transparent", "important");
        html.style.setProperty("background-color", "transparent", "important");
        body.style.setProperty("background", "transparent", "important");
        body.style.setProperty("background-color", "transparent", "important");
    }, []);

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
