/**
 * DayPeekView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 */
import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

const rowIn = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Wrap = styled.section`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin-top: 12px;
    padding: 0 2px;
`;

/* 홈의 SectionHead 와 같은 말 — 마름모, 글, 실선, 개수. 통째로 눌러 일간으로 간다 */
export const Head = styled.button<{ $today: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    width: 100%;
    min-height: 40px;
    padding: 0;
    background: none;
    border: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.74rem;
    letter-spacing: 0.18em;
    color: ${p => p.theme.colors.primary};
    cursor: pointer;
    text-align: left;

    .hd {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary};
        background: ${p => (p.$today ? p.theme.colors.primary : "transparent")};
    }

    .title { white-space: nowrap; font-variant-numeric: tabular-nums; }

    .hr {
        flex: 1;
        height: 1px;
        background: ${p => p.theme.colors.primary}42;
    }

    b {
        font-weight: 500;
        font-size: 0.66rem;
        letter-spacing: 0;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .open {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 0.64rem;
        letter-spacing: 0.12em;
        color: ${p => p.theme.colors.textSecondary};
        padding-left: 4px;
    }

    &:active .open { color: ${p => p.theme.colors.primary}; }

    /* 키 작은 폰에서는 오른쪽 아래에 떠 있는 + 단추(52px)가 이 줄 끝의 "N일간 >" 을 덮는다 — 그만큼 비켜 둔다 */
    ${MOBILE} { padding-right: 64px; }
`;

export const List = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* 오른쪽 아래 + 단추에 마지막 줄이 가리지 않게 */
    padding-bottom: 72px;
`;

export const Row = styled.button<{ $done: boolean }>`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 44px;
    padding: 6px 64px 6px 0;
    background: none;
    border: 0;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    font-family: inherit;
    font-size: 0.8rem;
    text-align: left;
    color: ${p => (p.$done ? p.theme.colors.textSecondary : p.theme.colors.text)};
    cursor: pointer;

    @media (prefers-reduced-motion: no-preference) {
        animation: ${rowIn} 0.24s ease-out both;
        &:nth-child(2) { animation-delay: 0.03s; }
        &:nth-child(3) { animation-delay: 0.06s; }
        &:nth-child(n + 4) { animation-delay: 0.09s; }
    }

    .mark {
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary}75;
    }

    .name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-decoration: ${p => (p.$done ? "line-through" : "none")};
        text-decoration-color: ${p => p.theme.colors.primary}75;
    }

    em {
        margin-left: auto;
        font-style: normal;
        font-size: 0.66rem;
        letter-spacing: 0.06em;
        color: ${p => p.theme.colors.textSecondary};
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
    }

    &:active { background: ${p => p.theme.colors.primary}12; }
`;

export const Empty = styled.p`
    margin: 0;
    padding: 14px 0;
    font-size: 0.78rem;
    color: ${p => p.theme.colors.textSecondary};
`;
