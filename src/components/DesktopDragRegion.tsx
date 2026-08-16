"use client";

import React from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { isDesktopApp } from "@/lib/apiBase";
import TitleBar from "@/components/titleBar/TitleBar";

const DRAG_ROUTES = ["/signIn", "/signUp", "/download"];

/**
 * 로그인·가입·다운로드 화면은 (main) 레이아웃 밖이라 타이틀바가 없다.
 * 드래그 영역만 있으면 창을 옮길 수는 있어도 닫을 수가 없다.
 */
export default function DesktopDragRegion() {
    const pathname = usePathname();
    const [desktop, setDesktop] = React.useState(false);

    React.useEffect(() => setDesktop(isDesktopApp()), []);

    const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    if (!desktop || !DRAG_ROUTES.includes(normalized)) return null;

    return (
        <Fixed>
            <TitleBar />
        </Fixed>
    );
}

const Fixed = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 900;
`;
