import type { MonthHeaderProps } from '../MonthHeader.types';
import CelestialArcana from '@/assets/celestial/CelestialArcana';
import * as S from './CelestialMonthHeader.styles';
export default function CelestialMonthHeader(p: MonthHeaderProps) {
    return <S.SkyHeader data-theme-layout="celestial-month-header"><S.Navigation>{p.navigation}</S.Navigation><CelestialArcana/><S.Filters>{p.filters}</S.Filters></S.SkyHeader>;
}
