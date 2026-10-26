"use client";

import { GemHeroScene } from '@/assets/gem/GemAssets';
import type { ComponentType } from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialHeroScene from "./celestial/CelestialHeroScene";
import MapleHeroScene from "./maple/MapleHeroScene";
import OceanHeroScene from './ocean/OceanHeroScene';

/** 소개 화면의 큰 그림 — Celestial 은 도는 금빛 혼천의(three.js), Maple 은 눌러 말린 잎과 떨어지는 잎 */
export default function HeroScene() {
    const View = usePickTheme<ComponentType>({ celestial: CelestialHeroScene, maple: MapleHeroScene, ocean: OceanHeroScene , gem: GemHeroScene });
    return <View />;
}
