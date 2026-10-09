"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialHeroScene from "./celestial/CelestialHeroScene";
import MapleHeroScene from "./maple/MapleHeroScene";
import OceanHeroScene from './ocean/OceanHeroScene';

/** 소개 화면의 큰 그림 — Celestial 은 도는 금빛 혼천의(three.js), Maple 은 눌러 말린 잎과 떨어지는 잎 */
export default function HeroScene() {
    const View = usePickTheme({ celestial: CelestialHeroScene, maple: MapleHeroScene, ocean: OceanHeroScene });
    return <View />;
}
