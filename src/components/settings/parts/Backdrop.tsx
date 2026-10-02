"use client";

import { usePickTheme } from "@/styles/themed";
import StarField from "../celestial/StarField";
import LeafField from "../maple/LeafField";
import OceanStarField from '../ocean/StarField';

/** 설정 화면 바탕의 옅은 그림. Celestial 은 별 필드, Maple 은 눌러 말린 잎 */
export default function Backdrop() {
    const View = usePickTheme({ celestial: StarField, maple: LeafField, ocean: OceanStarField });
    return <View />;
}
