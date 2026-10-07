"use client";

import { CircleCheck, CircleHelp, Info, TriangleAlert } from "lucide-react";
import type { DialogKind } from "./arcana";
import * as S from "./ocean/OceanEmblem.styles";

/** 종류마다 아이콘 하나 — 알림·물음·위험·완료 */
const ICON = { info: Info, confirm: CircleHelp, danger: TriangleAlert, ok: CircleCheck } as const;

/**
 * 바다 알림 창의 표식 — Celestial 의 아르카나 문양, Maple 의 도감 문장 자리.
 * 그림 대신 무채색 동그라미(40px) 안에 lucide 아이콘 하나. 크기(size)는 받지만 늘 같은 크기로 둔다.
 */
export default function OceanEmblem({ kind }: { kind: DialogKind; size?: number }) {
    const Icon = ICON[kind];
    return (
        <S.Mark $kind={kind} aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
        </S.Mark>
    );
}
