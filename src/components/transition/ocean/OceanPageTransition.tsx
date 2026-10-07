"use client";

import * as React from "react";
import useThemeMotion from "@/hooks/useThemeMotion";
import * as S from "./OceanPageTransition.styles";

let hasNavigated = false;

/**
 * 바다의 화면 바뀜 — 문양(Celestial)·떨어지는 잎(Maple) 같은 막 없이, 새 화면이 8px 아래에서 0.3초 동안 조용히 떠오른다.
 * 처음 연 화면과 움직임을 끈 사람에게는 움직이지 않는다.
 */
export default function OceanPageTransition({ children }: { children: React.ReactNode }) {
    const motion = useThemeMotion();
    const animate = hasNavigated && motion !== "off";

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <S.Stage>
            <S.Body $animate={animate}>{children}</S.Body>
        </S.Stage>
    );
}
