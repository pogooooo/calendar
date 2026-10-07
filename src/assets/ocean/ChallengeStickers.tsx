"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import * as S from "./ChallengeStickers.styles";

/**
 * 바다의 챌린지 칸 — 번호가 적힌 가는 동그라미. 해낸 날은 청록으로 차고 흰 체크가 선다.
 * 처음 그릴 때는 가만히, 그 뒤 바뀔 때만 한 번 살짝 커졌다 앉는다.
 * (Celestial: 초승달 → 보름달, Maple: 잎 윤곽 → 채운 잎)
 */
const OceanStickerInner = ({ isFilled, idx }: { isFilled: boolean; idx: number }) => {
    const first = useRef(true);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        setAnimate(true);
    }, [isFilled]);

    return (
        <S.Sticker $on={isFilled} $animate={animate} aria-hidden="true">
            {isFilled ? <Check size={16} strokeWidth={2.25} /> : idx + 1}
        </S.Sticker>
    );
};

// isFilled 가 바뀐 칸만 다시 그린다
export const DynamicSticker = React.memo(OceanStickerInner);
