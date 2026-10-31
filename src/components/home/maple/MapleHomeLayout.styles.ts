/**
 * Maple 홈의 배치 — 머리는 종이 위에 바로, 목록은 카드에.
 * 머리 격자: [날짜 | 날 옮기기] / [막대 띠] / [요약]. 날짜·띠·요약은 MapleMonthArch·ArchFoot 이 grid-area 로 제자리를 잡는다
 * (ArchWrap·MapleMonthArch 의 칸은 display: contents 라 이 격자의 칸이 된다). 폰에서는 한 줄로 쌓고 날 옮기기가 맨 아래.
 * 카드는 차례로 한 번 떠오른다(끝없는 움직임 없음).
 */
import styled, { css, keyframes } from 'styled-components';
import { paperCard } from '@/styles/maple/ink';
import { MOBILE } from '@/styles/breakpoints';

const rise = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
`;
const enter = (i: number) => css`
    animation: ${rise} 0.45s ${(i * 0.06).toFixed(2)}s ease-out both;
    html[data-theme-motion="off"] & { animation: none; }
`;

export const Journal = styled.div`
    width: min(1120px, 100%);
    margin: 0 auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: ${(p) => p.theme.colors.text};

    ${MOBILE} { gap: 14px; }
`;

export const JournalHeader = styled.header`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
        "title nav"
        "ribbon ribbon"
        "foot foot";
    align-items: end;
    column-gap: 24px;
    padding: 8px 2px 4px;

    ${MOBILE} {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: "title" "ribbon" "foot" "nav";
        padding: 4px 2px 0;
    }
`;

export const MonthPlate = styled.div`
    display: contents;
`;

/** 날 옮기기 — 큰 날짜와 같은 줄 오른쪽 */
export const DateBookmark = styled.div`
    grid-area: nav;
    min-width: 0;
    margin-bottom: 22px;

    & > * { justify-content: flex-end; }

    ${MOBILE} {
        margin: 14px 0 0;
        & > * { justify-content: center; }
    }
`;

/** 오늘 · 이번 주 — 카드 두 장 */
export const OpenPages = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    & > * {
        ${paperCard()}
        min-width: 0;
        min-height: 260px;
        padding: 22px 24px 16px 34px;
        border-radius:3px 10px 10px 3px;
        background-image:linear-gradient(90deg,transparent 23px,${(p)=>p.theme.colors.primary}22 23px,${(p)=>p.theme.colors.primary}22 24px,transparent 24px);
        box-shadow:0 2px 3px #0000000a,0 12px 30px -20px #00000055;
    }
    & > :nth-child(1) { ${enter(0)} }
    & > :nth-child(2) { ${enter(1)} }

    ${MOBILE} {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        & > * { min-height: 0; padding: 16px 16px 10px; }
    }
`;

/** 프로젝트 · 챌린지 · 기념일 — 카드 세 장 */
export const FieldNotes = styled.aside`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 8px 0 24px;
    border-top:1px solid ${(p)=>p.theme.colors.border}88;

    section {
        ${paperCard()}
        min-width: 0;
        padding: 18px 20px 14px;
    }
    section:nth-child(1) { ${enter(2)} }
    section:nth-child(2) { ${enter(3)} }
    section:nth-child(3) { ${enter(4)} }
    .mt { margin-top: 0; }

    @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); gap: 12px; }
    ${MOBILE} { section { padding: 16px 16px 10px; } }
`;
