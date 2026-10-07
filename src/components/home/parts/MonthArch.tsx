"use client";

import { usePickTheme } from "@/styles/themed";
import CelestialMonthArch from "../celestial/CelestialMonthArch";
import MapleMonthArch from "../maple/MapleMonthArch";
import OceanMonthArch from '../ocean/OceanMonthArch';

/** 홈 위의 달 게이지에 들어가는 것. 그림은 갈래마다 다르지만 읽는 자료는 같다 */
export interface MonthArchProps {
    daysInMonth: number;
    /** 바늘이 가리킬 날 — 홈에서 보고 있는 날 (0부터) */
    focusIdx: number;
    /** 날마다 걸린 일정 수 */
    monthLoad: number[];
    /** 마감(due)·기념일(anv) 표식 */
    marks: { day: number; kind: "due" | "anv" }[];
    /** 보고 있는 날 그 자체 — 날짜를 글로 쓰는 갈래(Ocean 의 날짜 머리)만 읽는다 */
    focus?: Date;
}

/** 갈래마다 제 그림 — Celestial 은 금빛 눈금 반원, Maple 은 놋쇠 해시계 */
export default function MonthArch(props: MonthArchProps) {
    const View = usePickTheme({ celestial: CelestialMonthArch, maple: MapleMonthArch, ocean: OceanMonthArch });
    return <View {...props} />;
}
