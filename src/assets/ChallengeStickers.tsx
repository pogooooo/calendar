"use client";

import React from "react";
import { usePickTheme } from "@/styles/themed";
import { DynamicSticker as CelestialSticker } from "./celestial/ChallengeStickers";
import { DynamicSticker as MapleSticker } from "./maple/MapleChallengeSticker";

/** 챌린지 스티커 한 칸. Celestial 은 초승달→보름달, Maple 은 잎 윤곽→채운 잎 */
export const DynamicSticker = React.memo(function DynamicSticker(props: { isFilled: boolean; idx: number }) {
    const View = usePickTheme({ celestial: CelestialSticker, maple: MapleSticker });
    return <View {...props} />;
});
