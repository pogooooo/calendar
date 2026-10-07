/**
 * 바다의 월간 머리 — 크게 기울인 세리프 달 이름과 작은 날짜 넘기개. 달이 바뀌면 달 이름이 살짝 떠오르며 바뀐다.
 * (Celestial: 금빛 실선 위 날짜와 아르카나, Maple: 책갈피 색인)
 */
import styled from "styled-components";
import { EASE, SERIF, calm, rise } from "@/styles/ocean/water";

export const Header = styled.header`
    position: relative;
    align-self: stretch;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 2px 2px 14px;
    @media (max-width: 768px) { align-items: center; gap: 8px; padding-bottom: 10px; }
`;

export const Title = styled.div`
    flex: none;
    font-family: ${SERIF};
    font-style: italic;
    font-size: 2.6rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    color: ${(p) => p.theme.colors.text};
    animation: ${rise} 0.5s ${EASE} both;
    ${calm}

    @media (max-width: 1100px) { font-size: 2.1rem; }
    @media (max-width: 768px) { display: none; }
`;

/** ‹ 10월 › · 오늘 — 가로로 한 줄 */
export const Nav = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    & > * { flex: none; }
    font-size: 0.95rem;
`;

export const Filters = styled.div`
    min-width: 0;
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-self: center;
`;
