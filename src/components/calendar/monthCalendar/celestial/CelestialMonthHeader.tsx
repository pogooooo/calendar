import type { MonthHeaderProps } from '../MonthHeader.types';
import CelestialMonthInstrument from './CelestialMonthInstrument';
import * as S from './CelestialMonthHeader.styles';
export default function CelestialMonthHeader(p: MonthHeaderProps) {
    return <S.SkyHeader data-theme-layout="celestial-month-header"><S.Navigation>{p.navigation}</S.Navigation><CelestialMonthInstrument month={p.month}/><S.Filters>{p.filters}</S.Filters></S.SkyHeader>;
}
