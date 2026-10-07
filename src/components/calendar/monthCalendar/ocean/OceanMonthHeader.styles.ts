/**
 * 바다의 월간 머리 — 왼쪽에 물방울 화살표 사이로 떠 있는 달 이름, 오른쪽에 거르개, 그 아래 잔물결 한 줄.
 * (Celestial: 금빛 실선 위 날짜, Maple: 책갈피 색인)
 */
import styled from "styled-components";
import { waveRule } from "@/styles/ocean/water";

export const Header = styled.header`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 4px 4px 16px;

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 4px;
        ${waveRule(0.3)}
    }

    & > svg { width: 44px; flex: none; opacity: 0.55; }
    @media (max-width: 768px) { gap: 8px; padding-bottom: 12px; & > svg { display: none; } }
`;

/** ‹ 10월 › · 오늘 — 가로로 한 줄 */
export const Nav = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    & > * { flex: none; }
    font-size: 1.25rem;
`;

export const Filters = styled.div`
    min-width: 0;
    flex: 1;
    display: flex;
    justify-content: flex-end;
`;
