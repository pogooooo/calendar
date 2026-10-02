"use client";

import type React from "react";
import { usePickTheme } from "@/styles/themed";
import MapleEmptyArt from "./maple/MapleEmptyArt";
import OceanEmptyArt from './ocean/OceanEmptyArt';

export type EmptyArtKind = "todos" | "projects" | "challenges" | "anniversaries";

/** Celestial 은 빈 화면에 글만 둔다 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CelestialEmptyArt = (props: { kind: EmptyArtKind }): React.ReactElement | null => null;

/** 빈 화면 위의 작은 그림. 갈래마다 다르다 — Maple 은 도감의 선화(벤치·공책·병·사진틀) */
export default function EmptyArt({ kind }: { kind: EmptyArtKind }) {
    const View = usePickTheme({ celestial: CelestialEmptyArt, maple: MapleEmptyArt, ocean: OceanEmptyArt });
    return <View kind={kind} />;
}
