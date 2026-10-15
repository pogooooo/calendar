/**
 * Maple 의 화살 — 꺾쇠 하나(lucide). Celestial 의 가는 금빛 화살(assets/celestial/Arrow) 자리.
 * 2026-10-15 다시 그리며 손으로 그은 먹 화살(ink-arrow-*.webp)을 걷었다 — 깃 달린 붓 화살이 단추로 읽히지 않았다.
 * 부르는 쪽이 준 자리(width × height)는 그대로 지키고, 꺾쇠는 그 안 가운데에 선다. 색은 stroke 가 없으면 둘레 글자색.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as S from "./MapleArrow.styles";

interface ArrowProps { width: number; height: number; stroke?: string; isRight: boolean }

const MapleArrow = ({ width, height, stroke, isRight }: ArrowProps) => {
    const Icon = isRight ? ChevronRight : ChevronLeft;
    return (
        <S.Box $w={width} $h={height} $ink={stroke} aria-hidden="true">
            <Icon size={Math.max(16, Math.min(20, width, height + 6))} strokeWidth={1.9} />
        </S.Box>
    );
};

export default MapleArrow;
