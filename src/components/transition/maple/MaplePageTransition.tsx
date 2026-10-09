"use client";

import * as React from "react";
import * as S from "./MaplePageTransition.styles";
import useThemeMotion from '@/hooks/useThemeMotion';
import type { Dir } from "@/styles/motion";

let hasNavigated = false;

/** 종이가 끝 소식을 못 받아도(숨은 창) 이만큼 뒤에는 걷는다 */
const SHEET_MS = 1000;

/**
 * Maple 의 화면 바뀜 — 다이어리 한 장을 넘긴다. 새 화면 위의 줄 쳐진 종이가 오는 쪽(direction)의 반대편으로 걷혀 나간다 —
 * 뒤 화면이면 왼쪽으로 넘어가 새 쪽이 오른쪽부터 드러나고, 앞 화면이면 거꾸로. 잎은 효과 무대(FxStage 의 page)가 흩날린다.
 * 처음 연 화면과 움직임을 끈 사람에게는 움직이지 않는다. '잔잔하게'면 종이 없이 옅게 나타나기만.
 */
export default function MaplePageTransition({ children, direction = 1 }: { children: React.ReactNode; direction?: Dir }) {
    const motion = useThemeMotion();
    const animate = hasNavigated && motion !== 'off';
    const [sheet, setSheet] = React.useState(animate && motion === 'full');

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    React.useEffect(() => {
        if (!sheet) return;
        const t = window.setTimeout(() => setSheet(false), SHEET_MS);
        return () => window.clearTimeout(t);
    }, [sheet]);

    return (
        <S.Stage>
            <S.Body $gentle={animate && motion === 'gentle'}>{children}</S.Body>
            {sheet && (
                <S.Sheet
                    aria-hidden="true"
                    data-page-transition-overlay
                    $dir={direction}
                    onAnimationEnd={(e) => { if (e.target === e.currentTarget) setSheet(false); }}
                />
            )}
        </S.Stage>
    );
}
