"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialEmptyArt from "./celestial/CelestialEmptyArt";
import MapleEmptyArt from "./maple/MapleEmptyArt";
import OceanEmptyArt from './ocean/OceanEmptyArt';

export type EmptyArtKind = "todos" | "projects" | "challenges" | "anniversaries";

/** 빈 화면 위의 작은 그림. 갈래마다 다르다 — Celestial 은 금 선화(해와 달·혼천의·팔각별·달의 위상, 3D 가 아닌 평면 문양), Maple 은 도감의 선화(벤치·공책·병·사진틀), Ocean 은 바다 유리(3D: 물방울·소라·방울·진주) */
export default function EmptyArt({ kind }: { kind: EmptyArtKind }) {
    const View = usePickTheme({ celestial: CelestialEmptyArt, maple: MapleEmptyArt, ocean: OceanEmptyArt });
    return <View kind={kind} />;
}
