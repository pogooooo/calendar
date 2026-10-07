"use client";
import type { HomeLayoutProps } from '../HomeLayout.types';
import CelestialArcana from '@/assets/celestial/CelestialArcana';
import * as S from './CelestialHomeLayout.styles';

export default function CelestialHomeLayout(p: HomeLayoutProps) {
    return <S.Observatory data-theme-layout="celestial-home">
        <S.SkyAlmanac data-ambient="celestial-almanac">{p.arch}<CelestialArcana liveMoon /></S.SkyAlmanac>
        <S.Navigation>{p.navigation}</S.Navigation>
        <S.OrbitGrid>
            <S.DailyReading {...p.listProps}>{p.today}{p.upcoming}</S.DailyReading>
            <S.Constellations><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.Constellations>
        </S.OrbitGrid>
        {p.dialogs}
    </S.Observatory>;
}
