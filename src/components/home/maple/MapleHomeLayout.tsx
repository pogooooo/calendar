"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import * as S from './MapleHomeLayout.styles';

export default function MapleHomeLayout(p: HomeLayoutProps) {
    return <S.Journal data-theme-layout="maple-home">
        <S.JournalHeader><S.MonthPlate>{p.arch}</S.MonthPlate><S.DateBookmark>{p.navigation}</S.DateBookmark></S.JournalHeader>
        <S.OpenPages {...p.listProps}>{p.today}{p.upcoming}</S.OpenPages>
        <S.FieldNotes><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.FieldNotes>
        {p.dialogs}
    </S.Journal>;
}
