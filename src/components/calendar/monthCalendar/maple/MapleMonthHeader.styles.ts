/**
 * Maple 의 월간 머리 — 노트 한 쪽의 제목 줄. 달 이름(명조, 화면 제목 크기)이 맨 앞, 그 뒤에 ‹ › 와 오늘, 오른쪽 끝에 거르개.
 * (Celestial: 금빛 실선 위 날짜와 아르카나, Ocean: 크게 기울인 라틴 달 이름)
 * 넘기개 안의 차례는 공용 JSX 가 ‹ 이름 › 오늘 로 주므로, 이름만 order 로 앞으로 뺀다.
 */
import styled from 'styled-components';
import { DateRangeDisplay } from './MapleMonthCalendar.styles';

export const Bookmark = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 40px;
    flex: none;
    margin-bottom: 14px;

    @media (max-width: 768px) { gap: 6px; margin-bottom: 10px; }
    /* 위젯 껍데기는 달력을 가장자리까지 깐다 — 달 이름이 테에 붙지 않게 양옆만 조금 */
    [data-widget] & { min-height: 0; margin-bottom: 4px; gap: 6px; padding: 0 6px; box-sizing: border-box; }
`;

export const FolioNavigation = styled(DateRangeDisplay)`
    width: auto;
    flex: 1;
    min-width: 0;
    margin: 0;
    gap: 2px;

    /* 달 이름(AnimatedDateText 의 상자)을 맨 앞으로 */
    & > div { order: -1; margin-right: 10px; }

    @media (max-width: 768px) { & > div { margin-right: 4px; } }
    [data-widget] & { margin: 0; & > div { margin-right: 4px; } }
`;

export const Index = styled.div`
    display: flex;
    align-items: center;
    flex: none;
    margin-left: auto;
`;
