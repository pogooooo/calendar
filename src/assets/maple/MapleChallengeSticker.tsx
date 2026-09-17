"use client";

import React, { useEffect, useRef, useState } from "react";
import * as S from "./MapleChallengeSticker.styles";

const MapleChallengeStickerInner = ({ isFilled }: { isFilled: boolean; idx: number }) => {
    // 처음 그릴 때는 도장 애니메이션 없이, 그 뒤 바뀔 때만
    const first = useRef(true);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        setAnimate(true);
    }, [isFilled]);

    return (
        <S.Sticker $on={isFilled} $animate={animate} aria-hidden="true">
            <span className="outline" />
            <span className="filled" />
        </S.Sticker>
    );
};

export const DynamicSticker = React.memo(MapleChallengeStickerInner);
