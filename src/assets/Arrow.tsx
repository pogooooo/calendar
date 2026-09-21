"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialArrow from "./celestial/Arrow";
import MapleArrow from "./maple/MapleArrow";

/** 주간 달력의 앞·뒤 화살. Celestial 은 가는 금빛 화살, Maple 은 먹선 끝의 잎 */
export default function Arrow(props: { width: number; height: number; stroke?: string; isRight: boolean }) {
    const View = usePickTheme({ celestial: CelestialArrow, maple: MapleArrow });
    return <View {...props} />;
}
