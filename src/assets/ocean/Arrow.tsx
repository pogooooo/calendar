"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrowProps { width: number; height: number; stroke?: string; isRight: boolean }

/**
 * 바다의 화살 — 그냥 꺾쇠 하나(lucide, 선 굵기 1.75). Celestial 의 가는 금빛 화살·Maple 의 먹 화살 대신.
 * 부르는 쪽이 준 자리(width × height)는 그대로 지키고, 꺾쇠는 그 안 가운데 16~20px 로 선다.
 * 색은 따로 주지 않으면 둘레 글자색을 따른다.
 */
export default function OceanArrow({ width, height, stroke, isRight }: ArrowProps) {
    const Icon = isRight ? ChevronRight : ChevronLeft;
    const size = Math.max(16, Math.min(20, width, height));
    return (
        <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width, height, color: stroke ?? "currentColor" }}>
            <Icon size={size} strokeWidth={1.75} />
        </span>
    );
}
