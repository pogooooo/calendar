"use client";

import * as React from "react";
import * as S from "./MapleEmblem.styles";
import type { DialogKind } from "../arcana";

/**
 * Maple 창의 문장 — Celestial 의 아르카나 문양 자리.
 * 알림은 잎 문장(C4), 물음은 도토리(F4), 위험은 밀랍 도장(F1), 완료는 체크 도장(C7).
 */
export default function MapleEmblem({ kind, size }: { kind: DialogKind; size: number }) {
    if (kind === "danger") {
        return <S.Seal src="/themes/maple/wax-seal.webp" alt="" width={size} height={size} draggable={false} aria-hidden="true" />;
    }
    return <S.Mark $kind={kind} style={{ width: size, height: size }} aria-hidden="true" />;
}
