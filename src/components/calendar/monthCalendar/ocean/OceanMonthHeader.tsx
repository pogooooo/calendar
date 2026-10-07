import type { MonthHeaderProps } from '../MonthHeader.types';
import Seashell from '@/assets/ocean/Seashell';
import * as S from './OceanMonthHeader.styles';

/** 바다의 월간 머리: [‹ 달 › 오늘] … [거르개] 조개 — 한 줄, 아래 잔물결 */
export default function OceanMonthHeader(p: MonthHeaderProps) {
    return <S.Header data-theme-layout="ocean-month-header">
        <S.Nav>{p.navigation}</S.Nav>
        <S.Filters>{p.filters}</S.Filters>
        <Seashell />
    </S.Header>;
}
