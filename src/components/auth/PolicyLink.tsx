"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isDesktopShell, isMobileShell } from "@/lib/platform";

/**
 * 개인정보처리방침(/privacy) 링크 — 가입·로그인·설정이 함께 쓴다(개인정보보호법 제30조: 쉽게 확인할 수 있게).
 * 웹은 새 탭으로 연다(쓰던 가입 칸이 그대로 남게). 앱(데스크톱·폰)은 새 탭을 열 수 없어 같은 창으로 —
 * 처리방침 화면 맨 위의 '돌아가기'로 돌아온다. 앱인지는 그린 뒤에 안다(서버 그림과 어긋나지 않게).
 */
export default function PolicyLink({ children, className }: { children: ReactNode; className?: string }) {
    const [inApp, setInApp] = useState(false);
    useEffect(() => { setInApp(isDesktopShell() || isMobileShell()); }, []);
    return (
        <a href="/privacy" className={className} {...(inApp ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
            {children}
        </a>
    );
}
