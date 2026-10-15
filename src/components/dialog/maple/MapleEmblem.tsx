"use client";

import * as React from "react";
import { Check, CircleHelp, TriangleAlert } from "lucide-react";
import * as S from "./MapleEmblem.styles";
import type { DialogKind } from "../arcana";

/**
 * Maple 알림 창의 문장 — Celestial 의 아르카나 문양 자리.
 * 옅게 물든 동그라미(48px) 안에 아이콘 하나: 알림은 단풍잎(벡터), 물음은 물음표, 위험은 세모 느낌표, 완료는 체크.
 * 예전의 먹 그림(잎 문장·도토리·밀랍 도장·체크 도장)은 걷었다. 크기(size)는 받지만 늘 같은 크기로 둔다.
 */
export default function MapleEmblem({ kind }: { kind: DialogKind; size?: number }) {
    return (
        <S.Mark $kind={kind} aria-hidden="true">
            {kind === "info" && <S.Leaf />}
            {kind === "confirm" && <CircleHelp />}
            {kind === "danger" && <TriangleAlert />}
            {kind === "ok" && <Check />}
        </S.Mark>
    );
}
