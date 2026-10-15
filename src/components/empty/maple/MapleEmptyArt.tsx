"use client";

import { CalendarHeart, NotebookPen, Sprout, type LucideIcon } from "lucide-react";
import * as S from "./MapleEmptyArt.styles";
import type { EmptyArtKind } from "../EmptyArt";

/**
 * 빈 자리의 작은 표식 — 옅은 붉은 동그라미 안에 한 빛깔 선 아이콘 하나.
 * 예전엔 먹 선화(벤치 위의 잎 · 잎을 끼운 공책 · 싹이 난 병 · 잎을 꽂은 사진틀)를 크게 깔았다 — 화면과 따로 놀아
 * 같은 뜻의 아이콘(공책 · 싹 · 기념일 달력)으로 작게 바꿨다.
 * 할 일(홈의 작은 카드)은 그림 없이 글만 둔다 — 카드가 작아 동그라미가 글보다 앞섰다(바다의 홈과 같은 결정).
 */
const ICON: Record<EmptyArtKind, LucideIcon | null> = {
    todos: null,
    projects: NotebookPen,
    challenges: Sprout,
    anniversaries: CalendarHeart,
};

export default function MapleEmptyArt({ kind }: { kind: EmptyArtKind }) {
    const Icon = ICON[kind];
    if (!Icon) return null;
    return (
        <S.Art data-empty-art={kind} aria-hidden="true">
            <Icon strokeWidth={1.6} focusable="false" />
        </S.Art>
    );
}
