/**
 * 바다의 월간 머리 — 왼쪽에 물빛 세리프 달 이름, 그 옆에 물방울 화살표 사이의 날짜, 오른쪽에 거르개·가리비.
 * 달이 바뀌면 달 이름이 물속에서 떠오르듯 흐림에서 또렷해진다.
 * (Celestial: 금빛 실선 위 날짜와 아르카나, Maple: 책갈피 색인)
 */
import styled, { keyframes } from "styled-components";
import { LATIN, calm, waveRule } from "@/styles/ocean/water";

const surface = keyframes`
    from { opacity: 0; transform: translateY(8px); filter: blur(4px); letter-spacing: 0.14em; }
    to   { opacity: 1; transform: translateY(0); filter: blur(0); letter-spacing: 0.04em; }
`;

export const Header = styled.header`
    position: relative;
    align-self: stretch;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 2px 4px 14px;

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 3px;
        ${waveRule(0.28)}
    }

    .shell { width: 34px; height: 34px; flex: none; transform: rotate(14deg); filter: drop-shadow(0 3px 4px rgba(4, 78, 92, 0.18)); }
    @media (max-width: 768px) { gap: 8px; padding-bottom: 10px; .shell { display: none; } }
`;

/** 달 이름 — 가는 세리프, 물빛 그라데이션 글씨 */
export const Title = styled.div`
    flex: none;
    font-family: ${LATIN};
    font-size: 2rem;
    line-height: 1;
    letter-spacing: 0.04em;
    color: ${(p) => p.theme.colors.primary};
    background: linear-gradient(180deg, ${(p) => (p.theme.mode === "dark" ? "#BFFBF5" : "#1AA3AE")}, ${(p) => (p.theme.mode === "dark" ? "#5FD8CF" : "#0B6A74")});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 1px 0 ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.9)")});
    animation: ${surface} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    ${calm}

    @media (max-width: 1100px) { font-size: 1.6rem; }
    @media (max-width: 768px) { display: none; }
`;

/** ‹ 10월 › · 오늘 — 가로로 한 줄 */
export const Nav = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    & > * { flex: none; }
    font-size: 1.1rem;
`;

export const Filters = styled.div`
    min-width: 0;
    flex: 1;
    display: flex;
    justify-content: flex-end;
`;
