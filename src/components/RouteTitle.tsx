"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/useT";

/**
 * 탭 제목을 화면 언어로 — "설정 · CRONOS". 예전엔 세 화면만 "설정 | 크로노스" 처럼 한국어로 박혀 있어
 * 영어 화면에서도 한국어였고, 나머지 화면은 모두 "CRONOS" 였다.
 */
export default function RouteTitle() {
    const pathname = usePathname();
    const t = useT();
    React.useEffect(() => {
        const s = t.sidebar;
        const names: Record<string, string> = {
            "/": s.home, "/calendar": s.calendar, "/category": s.categories, "/project": s.project,
            "/challenge": s.challenge, "/anniversary": s.anniversary, "/settings": s.settings,
        };
        const name = names[pathname.replace(/\/$/, "") || "/"];
        const want = name ? `${name} · CRONOS` : "CRONOS";
        // Next 가 화면을 옮긴 뒤 머리의 제목을 "CRONOS" 로 다시 쓰므로, 바뀌면 다시 맞춘다 (같으면 손대지 않아 되풀이되지 않는다)
        const apply = () => { if (document.title !== want) document.title = want; };
        apply();
        const mo = new MutationObserver(apply);
        mo.observe(document.head, { childList: true, subtree: true, characterData: true });
        return () => mo.disconnect();
    }, [pathname, t]);
    return null;
}
