/**
 * 바다의 홈 배치 — 넓은 화면: [날짜 판 | 같은 폭의 판 넷(2×2)]. 좁은 데스크톱: 날짜 판 아래 2×2. 폰: 한 줄.
 * 간격은 어디서나 16px(폰 12px), 판은 모두 20px 모서리의 반투명 유리. 차례로 살짝 떠오르며 한 번 나타난다.
 */
import styled, { css } from "styled-components";
import { EASE, R, calm, hairline, surface, surfaceIn } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";

/** 날짜 판과 2×2 를 나란히 둘 만큼 넓은 화면 */
const WIDE = "@media (min-width: 1240px)";
const GAP = 16;

const rise = (i: number) => css`
    animation: ${surfaceIn} 0.45s ${(i * 0.05).toFixed(2)}s ${EASE} both;
    ${calm}
`;

export const Bento = styled.div`
    width: min(1240px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: ${GAP}px;
    color: ${(p) => p.theme.colors.text};

    ${WIDE} {
        grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
        align-items: stretch;
    }
    ${MOBILE} { gap: 12px; padding-bottom: 8px; }
`;

/** 왼쪽 — 날짜와 그날 목록이 든 판 한 장 */
export const Day = styled.section`
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 24px 10px;
    ${surface("panel")}
    border-radius: ${R.lg};
    border-top:2px solid ${(p)=>p.theme.colors.primary}55;
    min-height:420px;
    ${rise(0)}

    ${MOBILE} { padding:18px 16px 6px;min-height:0; }
`;

/** 날 옮기기 — 눈금 띠 아래 */
export const Controls = styled.div`
    margin-top: 20px;
    ${MOBILE} { margin-top: 16px; }
`;

/** 그날 목록 — 머리카락 선 하나 아래 */
export const List = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${(p) => hairline(p.theme)};

    & > * { flex: 1; min-height: 0; }
    ${MOBILE} { margin-top: 14px; padding-top: 14px; }
`;

/** 오른쪽 — 같은 폭의 판 넷 */
export const Cards = styled.div`
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: stretch;
    gap: ${GAP}px;

    ${MOBILE} { grid-template-columns: minmax(0, 1fr); gap: 12px; }
`;

export const Card = styled.section<{ $at: number }>`
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 18px 20px 10px;
    ${surface("panel")}
    border-radius: ${R.lg};
    ${(p) => rise(p.$at)}

    /* 목록 하나만 든 판(이번 주)은 판 키만큼 늘어나, 빈 문구가 가운데 선다 */
    & > :only-child { flex: 1; }
    /* 기둥 사이 간격(Celestial 의 .mt)은 판마다 따로라 필요 없다 */
    .mt { margin-top: 0; }

    ${MOBILE} { padding: 16px 16px 6px; }
`;
