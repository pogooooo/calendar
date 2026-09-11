"use client";

import React from "react";
import { usePathname } from "next/navigation";
import styled, { createGlobalStyle } from "styled-components";
import { isDesktopShell } from "@/lib/platform";
import TitleBar from "@/components/titleBar/TitleBar";

const DRAG_ROUTES = ["/signIn", "/signUp", "/download", "/forgotPassword", "/resetPassword"];

/**
 * 로그인·가입·비밀번호 재설정·다운로드 화면은 (main) 레이아웃 밖이라 타이틀바가 없다.
 * 드래그 영역만 있으면 창을 옮길 수는 있어도 닫을 수가 없다.
 */
export default function DesktopDragRegion() {
    const pathname = usePathname();
    const [desktop, setDesktop] = React.useState(false);

    // 폰(안드로이드)에는 옮길 창이 없다. 자리만 차지하고 화면을 밀어낸다.
    React.useEffect(() => setDesktop(isDesktopShell()), []);

    const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    if (!desktop || !DRAG_ROUTES.includes(normalized)) return null;

    return (
        <>
            {/* 타이틀바가 고정 위치라 그만큼 본문을 아래로 밀어야 화면이 잘리지 않는다 */}
            <ReserveSpace />
            <Fixed>
                <TitleBar />
            </Fixed>
        </>
    );
}

export const TITLEBAR_HEIGHT = 36;

const ReserveSpace = createGlobalStyle`
    :root { --titlebar-h: ${TITLEBAR_HEIGHT}px; }

    /* body 높이(100vh) 안에서 자리를 빼야 문서에 스크롤이 생기지 않는다 */
    body {
        box-sizing: border-box;
        padding-top: var(--titlebar-h);
    }
`;

const Fixed = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 900;
`;
