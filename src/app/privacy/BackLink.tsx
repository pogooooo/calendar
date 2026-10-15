"use client";

import { useEffect, useState } from "react";

/**
 * 처리방침 맨 위의 '돌아가기' — 앱(데스크톱·폰)은 처리방침을 같은 창으로 열어 뒤로 갈 길이 필요하다(src/components/auth/PolicyLink.tsx).
 * 바로 이 주소로 들어온 사람(구글 플레이·새 탭)에게는 돌아갈 곳이 없으니 보이지 않는다.
 */
export default function BackLink({ label }: { label: string }) {
    const [show, setShow] = useState(false);
    useEffect(() => { setShow(window.history.length > 1 && document.referrer.startsWith(window.location.origin)); }, []);
    if (!show) return null;
    return (
        <p className="back">
            <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>← {label}</a>
        </p>
    );
}
