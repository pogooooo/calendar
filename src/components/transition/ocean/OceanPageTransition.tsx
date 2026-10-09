"use client";

import * as React from "react";
import useThemeMotion from "@/hooks/useThemeMotion";
import type { Dir } from "@/styles/motion";
import * as S from "./OceanPageTransition.styles";

let hasNavigated = false;

/** 막이 끝 소식을 못 받아도(숨은 창) 이만큼 뒤에는 걷는다 */
const VEIL_MS = 1000;

/**
 * 바다의 화면 바뀜 — 문양(Celestial)·종이(Maple) 대신 물속에서 떠오르듯: 새 화면 위의 물안개가 오는 쪽(direction)부터 걷히고
 * 물빛 한 줄기가 지나간다. 판들은 제 자리에서 떠오른다(각 판의 surfaceIn). 누른 자리의 물결 고리는 효과 무대(FxStage 의 page)가 그린다.
 * 처음 연 화면과 움직임을 끈 사람에게는 움직이지 않는다. '잔잔하게'면 흐림·흐름 없이 막의 색만 옅게 걷힌다.
 */
export default function OceanPageTransition({ children, direction = 1 }: { children: React.ReactNode; direction?: Dir }) {
    const motion = useThemeMotion();
    const [veil, setVeil] = React.useState(hasNavigated && motion !== "off");

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    React.useEffect(() => {
        if (!veil) return;
        const t = window.setTimeout(() => setVeil(false), VEIL_MS);
        return () => window.clearTimeout(t);
    }, [veil]);

    return (
        <S.Stage>
            <S.Body>{children}</S.Body>
            {veil && (
                <S.Veil
                    aria-hidden="true"
                    data-page-transition-overlay
                    $dir={direction}
                    $gentle={motion === "gentle"}
                    onAnimationEnd={(e) => { if (e.target === e.currentTarget) setVeil(false); }}
                />
            )}
        </S.Stage>
    );
}
