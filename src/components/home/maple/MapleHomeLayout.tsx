"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import { useState, type PointerEvent } from 'react';
import useThemeMotion from '@/hooks/useThemeMotion';
import { useSimpleMobileAppearance } from '@/hooks/useMobilePresentation';
import type { Dir } from '@/styles/motion';
import * as S from './MapleHomeLayout.styles';

export default function MapleHomeLayout(p: HomeLayoutProps) {
    const level = useThemeMotion();
    const compact = useSimpleMobileAppearance();
    const [turn, setTurn] = useState<{key:string;direction:Dir}>({ key:p.dateKey, direction:1 });
    if (turn.key !== p.dateKey) setTurn({ key:p.dateKey, direction:p.dateKey < turn.key ? -1 : 1 });

    function moveLight(event: PointerEvent<HTMLElement>) {
        if (level !== 'full' || event.pointerType !== 'mouse') return;
        const cover = event.currentTarget.querySelector<HTMLElement>('[data-maple-cover]');
        if (!cover) return;
        const box = cover.getBoundingClientRect();
        cover.style.setProperty('--paper-x', `${(event.clientX - box.left) / box.width * 100}%`);
        cover.style.setProperty('--paper-y', `${(event.clientY - box.top) / box.height * 100}%`);
    }

    return <S.Journal data-theme-layout="maple-home" $compact={compact}>
        <S.JournalHeader {...p.listProps} data-compact={compact || undefined} onPointerMove={moveLight}>
            {p.arch}
            <S.DateBookmark>{p.navigation}</S.DateBookmark>
        </S.JournalHeader>
        <S.Reading turnKey={p.dateKey} direction={turn.direction} level={level}>
            <S.OpenPages>{p.today}{p.upcoming}</S.OpenPages>
        </S.Reading>
        <S.FieldNotes><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.FieldNotes>
        {p.dialogs}
    </S.Journal>;
}
