"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialAnniversaryIcon from "./celestial/AnniversaryIcons";
import MapleAnniversaryIcon from "./maple/MapleAnniversaryIcon";

export { ANNIVERSARY_ICONS, resolveIconKey } from "./celestial/AnniversaryIcons";
export type { AnniversaryIconKey } from "./celestial/AnniversaryIcons";

/** 기념일 아이콘 — Celestial 은 가는 선 SVG, Maple 은 먹으로 그린 아이콘 시트(D2)의 한 칸 */
export default function AnniversaryIcon(props: { name?: string | null; size?: number; strokeWidth?: number }) {
    const View = usePickTheme({ celestial: CelestialAnniversaryIcon, maple: MapleAnniversaryIcon });
    return <View {...props} />;
}
