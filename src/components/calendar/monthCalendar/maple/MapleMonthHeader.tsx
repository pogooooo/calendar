import type { MonthHeaderProps } from '../MonthHeader.types';
import * as S from './MapleMonthHeader.styles';

/** Maple 의 월간 머리: 왼쪽에 명조로 쓴 달 이름과 ‹ › 오늘, 오른쪽 끝에 거르개 (노트 한 쪽의 제목 줄) */
export default function MapleMonthHeader(p: MonthHeaderProps) {
    return <S.Bookmark data-theme-layout="maple-month-header"><S.FolioNavigation>{p.navigation}</S.FolioNavigation><S.Index>{p.filters}</S.Index></S.Bookmark>;
}
