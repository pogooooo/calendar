"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import * as S from './GemHomeLayout.styles';

export default function GemHomeLayout(p:HomeLayoutProps) {
    return <S.Page data-theme-layout="gem-home">
        <S.Cabinet>{p.arch}{p.navigation}</S.Cabinet>
        <S.Grid>
            <S.Reading {...p.listProps}>{p.today}{p.upcoming}</S.Reading>
            <S.Collection><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.Collection>
        </S.Grid>{p.dialogs}
    </S.Page>;
}
