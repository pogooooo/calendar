import type { MonthHeaderProps } from '../MonthHeader.types';
import * as S from './MapleMonthHeader.styles';
export default function MapleMonthHeader(p: MonthHeaderProps) {
    return <S.Bookmark data-theme-layout="maple-month-header"><S.Index>{p.filters}</S.Index><S.FolioNavigation>{p.navigation}</S.FolioNavigation></S.Bookmark>;
}
