"use client";
/**
 * Ocean 의 빈 자리 그림 — 그 화면의 내비 아이콘(OceanNavIcon 과 같은 것)을 물빛 한 빛깔로 옅게, 작게.
 * 예전에는 바다 유리 3D 오브제(물방울·앵무조개·방울·진주)였는데 화면과 따로 놀았다(사용자: "이런건 단색으로 해도 될듯").
 * 할 일(홈)은 그림 없이 글만 둔다 — 사용자: "모바일 홈 화면의 물방울 지워줘".
 */
import { Flag, FolderKanban, Gift, type LucideIcon } from "lucide-react";
import type { EmptyArtKind } from "../EmptyArt";
import * as S from "./OceanEmptyArt.styles";

const ICON: Record<EmptyArtKind, LucideIcon | null> = {
    todos: null,
    projects: FolderKanban,
    challenges: Flag,
    anniversaries: Gift,
};

export default function OceanEmptyArt({ kind }: { kind: EmptyArtKind }) {
    const Icon = ICON[kind];
    if (!Icon) return null;
    return (
        <S.Art data-empty-art={kind} aria-hidden="true">
            <Icon size="100%" strokeWidth={1.3} />
        </S.Art>
    );
}
