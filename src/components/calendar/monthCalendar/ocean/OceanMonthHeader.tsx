import type { MonthHeaderProps } from '../MonthHeader.types';
import { Scallop } from '@/assets/ocean/SeaLife';
import * as S from './OceanMonthHeader.styles';

const LATIN_MONTH = new Intl.DateTimeFormat('en', { month: 'long' });

/**
 * 바다의 월간 머리: 왼쪽에 가는 세리프로 쓴 달 이름("October" — 참고 그림의 "Under the Sea"),
 * 그 옆에 [‹ 달 › 오늘], 오른쪽 끝에 거르개와 가리비 하나. 아래로 잔물결 한 줄.
 * 달 이름은 장식이라 읽어 주지 않는다 (옆의 날짜 글씨가 같은 말을 한다).
 */
export default function OceanMonthHeader(p: MonthHeaderProps) {
    return <S.Header data-theme-layout="ocean-month-header">
        {p.month && <S.Title aria-hidden="true" key={p.month.getMonth()}>{LATIN_MONTH.format(p.month)}</S.Title>}
        <S.Nav>{p.navigation}</S.Nav>
        <S.Filters>{p.filters}</S.Filters>
        <Scallop className="shell" tone="peach" />
    </S.Header>;
}
