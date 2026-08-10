"use client";

import React from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { isDesktopApp } from "@/lib/apiBase";

const DRAG_ROUTES = ["/signIn", "/signUp", "/download"];

export default function DesktopDragRegion() {
    const pathname = usePathname();
    const [desktop, setDesktop] = React.useState(false);

    React.useEffect(() => setDesktop(isDesktopApp()), []);

    const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    if (!desktop || !DRAG_ROUTES.includes(normalized)) return null;

    return <Strip data-tauri-drag-region />;
}

const Strip = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 110px;
    height: 32px;
    z-index: 900;
`;
