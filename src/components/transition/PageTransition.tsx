"use client";

import GemPageTransition from './gem/GemPageTransition';
import * as React from "react";
import { usePathname } from "next/navigation";
import { usePickTheme } from "@/styles/themed";
import CelestialPageTransition from "./celestial/CelestialPageTransition";
import MaplePageTransition from "./maple/MaplePageTransition";
import OceanPageTransition from './ocean/OceanPageTransition';
import type { Dir } from "@/styles/motion";

/** 갈래의 화면 바뀜 — direction 은 오는 쪽 (1: 뒤 화면이라 오른쪽에서, -1: 앞 화면이라 왼쪽에서). 안 쓰는 갈래도 있다 */
type TransitionViewType = React.ComponentType<{ children: React.ReactNode; direction?: Dir }>;

/** 화면의 차례 — 탭바·메뉴에 놓인 차례. 뒤 화면으로 가면 새 화면이 오른쪽에서, 앞 화면으로 가면 왼쪽에서 들어온다 */
const ORDER = ["/", "/calendar", "/project", "/challenge", "/category", "/anniversary", "/settings", "/download"];
const rank = (p: string) => ORDER.findIndex((r) => (r === "/" ? p === "/" : p === r || p.startsWith(`${r}/`)));

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const TransitionView = usePickTheme<TransitionViewType>({ celestial: CelestialPageTransition, maple: MaplePageTransition, ocean: OceanPageTransition , gem: GemPageTransition });

    // 화면이 바뀐 그 그림에서 차례를 정한다 (렌더 중에 앞 값을 맞추는 React 의 방식 — 새 화면이 옛 차례로 한 번 그려지지 않는다)
    const [nav, setNav] = React.useState<{ path: string; dir: Dir }>({ path: pathname, dir: 1 });
    if (nav.path !== pathname) {
        const from = rank(nav.path);
        const to = rank(pathname);
        setNav({ path: pathname, dir: from >= 0 && to >= 0 && to < from ? -1 : 1 });
    }

    return <TransitionView key={pathname} direction={nav.dir}>{children}</TransitionView>;
}
