"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialHeroScene from "./celestial/CelestialHeroScene";
import MapleHeroScene from "./maple/MapleHeroScene";

/** 소개 화면의 큰 그림 — Celestial 은 도는 금빛 고리(three.js), Maple 은 눌러 말린 잎과 떨어지는 잎 */
export default function HeroScene() {
    const View = usePickTheme({ celestial: CelestialHeroScene, maple: MapleHeroScene });
    return <View />;
}
