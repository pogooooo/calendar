"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import * as S from './MapleHomeLayout.styles';

/**
 * Maple 의 홈 — 가을 노트의 첫 장.
 * 머리: 명조로 크게 쓴 날짜(왼쪽)와 날 옮기기(오른쪽), 그 아래 그달의 막대 띠와 요약 한 줄 — 종이 위에 바로 쓴다.
 * 그 아래 카드 두 장(오늘 · 이번 주), 맨 아래 카드 세 장(프로젝트 · 챌린지 · 기념일).
 * (Celestial: 하늘 반원 아래 두 목록과 오른쪽 기둥 / Ocean: 날짜 판과 2×2 벤토)
 */
export default function MapleHomeLayout(p: HomeLayoutProps) {
    return <S.Journal data-theme-layout="maple-home">
        <S.JournalHeader><S.MonthPlate>{p.arch}</S.MonthPlate><S.DateBookmark>{p.navigation}</S.DateBookmark></S.JournalHeader>
        <S.OpenPages {...p.listProps}>{p.today}{p.upcoming}</S.OpenPages>
        <S.FieldNotes><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.FieldNotes>
        {p.dialogs}
    </S.Journal>;
}
