import type { MonthHeaderProps } from '../MonthHeader.types';
import { Sparkles } from 'lucide-react';
import { MoonDisc } from '@/components/ornament/celestial/CelestialOrnaments';
import * as S from './CelestialMonthHeader.styles';
export default function CelestialMonthHeader(p: MonthHeaderProps) {
    return <S.SkyHeader data-theme-layout="celestial-month-header">
        <S.Navigation>{p.navigation}</S.Navigation>
        <S.Phases aria-hidden="true" viewBox="0 0 190 20">{Array.from({length:8},(_,i)=><MoonDisc key={i} cx={11+i*24} cy={10} r={5} phase={i/8} />)}</S.Phases>
        <Sparkles className="header-star" size={17} strokeWidth={1.2} aria-hidden="true" />
        <S.Filters>{p.filters}</S.Filters>
    </S.SkyHeader>;
}
