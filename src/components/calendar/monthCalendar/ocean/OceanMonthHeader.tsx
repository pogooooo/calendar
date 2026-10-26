import type { MonthHeaderProps } from '../MonthHeader.types';
import * as S from './OceanMonthHeader.styles';

const LATIN_MONTH = new Intl.DateTimeFormat('en', { month: 'long' });

/**
 * 바다의 월간 머리: 왼쪽에 기울인 세리프로 크게 쓴 달 이름("October"), 옆에 작게 [‹ 2026년 10월 › 오늘],
 * 오른쪽 끝에 거르개. 글자 크기의 대비가 곧 장식이다.
 * 달 이름은 장식이라 읽어 주지 않는다 (옆의 날짜 글씨가 같은 말을 한다).
 */
export default function OceanMonthHeader(p: MonthHeaderProps) {
    return <S.Header data-theme-layout="ocean-month-header">
        {p.month && <S.Title aria-hidden="true"><span className="eyebrow">MAKE ROOM FOR YOUR DAY</span><span className="month" key={p.month.getMonth()}>{LATIN_MONTH.format(p.month)}<i> / {String(p.month.getMonth() + 1).padStart(2, '0')}</i></span></S.Title>}
        <S.Nav>{p.navigation}</S.Nav>
        <S.Filters>{p.filters}</S.Filters>
    </S.Header>;
}
