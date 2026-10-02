"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialAuthPanel from "./CelestialAuthPanel";
import MapleAuthPanel from "./MapleAuthPanel";
import OceanAuthPanel from './OceanAuthPanel';

/** 로그인·가입 옆의 그림. 갈래마다 아예 다른 그림이다 — Celestial 은 별자리 고리, Maple 은 도감 한 장 */
export default function AuthPanel({ busy = false }: { busy?: boolean }) {
    const View = usePickTheme({ celestial: CelestialAuthPanel, maple: MapleAuthPanel, ocean: OceanAuthPanel });
    return <View busy={busy} />;
}
