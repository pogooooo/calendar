"use client";

import { usePickTheme } from "@/styles/themed";
import styled from "styled-components";
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
    const View = usePickTheme({ celestial: CelestialDayCellDecor, maple: MapleDayCellDecor, ocean: OceanDayCellDecor, gem: GemDayCellDecor });
    return <View {...props} />;
}

function GemDayCellDecor({ tier, connectLeft, connectRight }: DayCellDecorProps) {
    return tier > 0 ? <GemEdge aria-hidden="true" $tier={tier} $left={connectLeft} $right={connectRight} /> : null;
}

const GemEdge = styled.span<{ $tier: number; $left?: boolean; $right?: boolean }>`
    position: absolute;
    inset-inline-start: ${p => p.$left ? "0" : "5px"};
    inset-inline-end: ${p => p.$right ? "0" : "5px"};
    inset-block-end: 1px;
    z-index: 1;
    height: 2px;
    border-radius: 999px;
    background: var(--gem-gold-edge);
    opacity: ${p => .25 + p.$tier * .2};
    pointer-events: none;
`;
