import type { MonthHeaderProps } from '../MonthHeader.types';
import * as S from './MapleMonthHeader.styles';

/** Maple 의 월간 머리: 왼쪽에 명조로 쓴 달 이름과 ‹ › 오늘, 오른쪽 끝에 거르개 (노트 한 쪽의 제목 줄) */
export default function MapleMonthHeader(p: MonthHeaderProps) {
    return <S.Bookmark data-calendar-header data-theme-layout="maple-month-header">
        <S.MonthIndex data-calendar-decoration aria-hidden="true">MONTHLY NOTES<span>{String((p.month?.getMonth() ?? 0) + 1).padStart(2, '0')} / {p.month?.getFullYear()}</span></S.MonthIndex>
        <S.MonthTrack data-calendar-decoration aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i} className={i===p.month?.getMonth()?'active':undefined}>{String(i+1).padStart(2,'0')}</span>)}</S.MonthTrack>
        <S.FolioNavigation data-calendar-navigation>{p.navigation}</S.FolioNavigation><S.Index>{p.filters}</S.Index>
    </S.Bookmark>;
}
