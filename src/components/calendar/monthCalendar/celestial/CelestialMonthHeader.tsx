"use client";
import { usePathname } from 'next/navigation';
import type { MonthHeaderProps } from '../MonthHeader.types';
import CelestialArcana from '@/assets/celestial/CelestialArcana';
import * as S from './CelestialMonthHeader.styles';
/** 달 이름 옆의 작은 표지 — 본 창에서는 오늘의 실제 달(3D, 멈춘 한 장), 위젯 창에서는 표지째 숨는다 */
export default function CelestialMonthHeader(p: MonthHeaderProps) {
    const inWidget = !!usePathname()?.startsWith('/widget');
    return <S.SkyHeader data-theme-layout="celestial-month-header"><S.Navigation>{p.navigation}</S.Navigation><CelestialArcana liveMoon={!inWidget} moonScale={2}/><S.Filters>{p.filters}</S.Filters></S.SkyHeader>;
}
