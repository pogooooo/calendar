"use client";

import * as React from "react";
import * as S from "./MaplePageTransition.styles";
import useThemeMotion from '@/hooks/useThemeMotion';
import type { Dir } from "@/styles/motion";

let hasNavigated = false;

/**
 * Maple 의 화면 바뀜 — 바람 한 줄기가 지나가며 새 쪽이 옅게 떠오른다. 바람은 효과 무대(FxStage 의 page)가 맡는다:
 * 나무 쪽(오른쪽)에서 잎 몇 장이 화면을 가로질러 날고, 바탕의 단풍 장면에도 돌풍이 불어 가지와 지는 잎이 같이 쓸린다.
 * 2026-10-16 까지는 줄 쳐진 종이 한 장이 걷혀 나갔다 — 화면을 통째로 덮는 불투명한 판이 무겁고 바탕 장면을 가렸다.
 * 처음 연 화면과 움직임을 끈 사람에게는 움직이지 않는다. '잔잔하게'면 더 짧게(효과 무대도 바람을 쉰다).
 */
export default function MaplePageTransition({ children, direction = 1 }: { children: React.ReactNode; direction?: Dir }) {
    const motion = useThemeMotion();
    // 이 화면에 들어온 그 순간에 한 번만 정한다 — 그릴 때마다 정하면 움직임 설정을 바꾸는 순간 화면이 다시 나타났다
    const [enter] = React.useState<"full" | "gentle" | null>(() => (hasNavigated && motion !== "off" ? motion : null));

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <S.Stage>
            {enter && <S.PageEdge aria-hidden="true" $dir={direction} $gentle={enter === 'gentle'} />}
            <S.Body $enter={enter}>{children}</S.Body>
        </S.Stage>
    );
}
