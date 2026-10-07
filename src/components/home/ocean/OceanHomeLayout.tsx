"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import * as S from './OceanHomeLayout.styles';

/**
 * 바다의 홈 — 가지런한 벤토 격자.
 * 왼쪽: 판 한 장 — 위에 크게 쓴 날짜와 그달의 눈금, 그 아래 날 옮기기와 그날 목록.
 * 오른쪽: 같은 폭의 판 넷(이번 주 · 프로젝트 / 챌린지 · 기념일)이 2×2 로 맞물린다.
 * 좁은 데스크톱은 날짜 판 아래로 2×2, 폰은 한 줄로 쌓는다.
 * (Celestial: 하늘 반원 아래 두 목록과 오른쪽 기둥 / Maple: 펼친 다이어리와 아래 세 칸)
 */
export default function OceanHomeLayout(p: HomeLayoutProps) {
    return <S.Bento data-theme-layout="ocean-home">
        <S.Day {...p.listProps}>
            {p.arch}
            <S.Controls>{p.navigation}</S.Controls>
            <S.List>{p.today}</S.List>
        </S.Day>
        <S.Cards>
            <S.Card $at={1}>{p.upcoming}</S.Card>
            <S.Card $at={2}>{p.projects}</S.Card>
            <S.Card $at={3}>{p.challenges}</S.Card>
            <S.Card $at={4}>{p.anniversaries}</S.Card>
        </S.Cards>
        {p.dialogs}
    </S.Bento>;
}
