"use client";

import type { ComponentType } from "react";
import { usePickTheme } from "@/styles/themed";
import StarField from "../celestial/StarField";
import OceanStarField from '../ocean/StarField';

/** Maple 은 바탕 그림을 두지 않는다 — 앱 바탕에 지는 잎(MapleAtmosphere)으로 족하다 (예전의 큰 수채 잎 넉 장은 걷었다) */
const NoBackdrop = () => null;

/** 설정 화면 바탕의 옅은 그림. Celestial 은 별 필드, Ocean 은 물빛, Maple 은 없음 */
export default function Backdrop() {
    const View = usePickTheme<ComponentType>({ celestial: StarField, maple: NoBackdrop, ocean: OceanStarField , gem: NoBackdrop });
    return <View />;
}
