"use client";

import { GemDayCellDecor } from '@/assets/gem/GemAssets';
import { usePickTheme } from "@/styles/themed";
import CelestialDayCellDecor from "./celestial/DayCellDecor";
import MapleDayCellDecor from "./maple/MapleDayCellDecor";
import OceanDayCellDecor from './ocean/DayCellDecor';

export interface DayCellDecorProps {
    /** 바쁜 정도. 0 이면 아무것도 안 그린다 */
    tier: number;
    connectLeft?: boolean;
    connectRight?: boolean;
}

/** 달력 칸 뒤의 꾸밈. Celestial 은 금빛 틀, Maple 은 황토 물 */
export default function DayCellDecor(props: DayCellDecorProps) {
    const View = usePickTheme({ celestial: CelestialDayCellDecor, maple: MapleDayCellDecor, ocean: OceanDayCellDecor , gem: GemDayCellDecor });
    return <View {...props} />;
}
