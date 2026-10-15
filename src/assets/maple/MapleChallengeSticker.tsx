"use client";

import React, { useEffect, useRef, useState } from "react";
import * as S from "./MapleChallengeSticker.styles";

/** 붙인 잎이 칸마다 조금씩 다른 각도로 — 손으로 붙인 것처럼(같은 칸은 늘 같은 각도) */
const tiltOf = (idx: number) => ((idx * 47) % 31) - 15;

/**
 * 챌린지 스티커 한 칸 — 빈 칸은 옅은 동그라미에 회차 번호, 채운 칸은 단풍 붉은 동그라미에 벡터 단풍잎.
 * 예전엔 먹으로 그린 톱니 테두리 잎 그림(C11·C12)을 씌웠다 — 작게 줄이면 뭉개져 벡터로 다시 그렸다.
 */
const MapleChallengeStickerInner = ({ isFilled, idx }: { isFilled: boolean; idx: number }) => {
    // 처음 그릴 때는 도장 애니메이션 없이, 그 뒤 바뀔 때만
    const first = useRef(true);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        setAnimate(true);
    }, [isFilled]);

    return (
        <S.Sticker $on={isFilled} $animate={animate} $tilt={tiltOf(idx)} aria-hidden="true">
            <span className="num">{idx + 1}</span>
            <span className="leaf" />
        </S.Sticker>
    );
};

export const DynamicSticker = React.memo(MapleChallengeStickerInner);
