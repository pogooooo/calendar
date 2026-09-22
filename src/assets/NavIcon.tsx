"use client";

import type { ReactNode } from "react";
import { usePickTheme } from "@/styles/themed";
import MapleNavIcon from "./maple/MapleNavIcon";
import type { NavIconName } from "./maple/MapleNavIcon";

export type { NavIconName };

/** Celestial 은 지금까지의 선 아이콘(lucide·assets/icons) 그대로 — 쓰는 쪽이 넘긴 것을 그린다 */
const CelestialNavIcon = ({ fallback }: { name: NavIconName; size: number; fallback: ReactNode }) => <>{fallback}</>;

/**
 * 내비 아이콘 — Celestial 은 가는 선 아이콘, Maple 은 먹으로 그린 아이콘 시트(D1)의 한 칸.
 * fallback 에 Celestial 의 아이콘 요소를 넘긴다 (갈래마다 다른 그림이므로 여기서 고른다).
 */
export default function NavIcon(props: { name: NavIconName; size: number; fallback: ReactNode }) {
    const View = usePickTheme({ celestial: CelestialNavIcon, maple: MapleNavIcon });
    return <View {...props} />;
}
