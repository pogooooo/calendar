import type { MonthHeaderProps } from '../MonthHeader.types';
import Seashell from '@/assets/ocean/Seashell';
import * as S from './OceanMonthHeader.styles';
export default function OceanMonthHeader(p:MonthHeaderProps) {
    return <S.Header data-theme-layout="ocean-month-header"><div>{p.navigation}{p.filters}</div><Seashell /></S.Header>;
}
