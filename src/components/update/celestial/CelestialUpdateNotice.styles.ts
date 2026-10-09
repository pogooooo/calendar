/**
 * 업데이트 알림(데스크톱 오른쪽 아래 쪽지)의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { css, keyframes } from "styled-components";
import { celestialOnly, star4Mark } from "@/styles/celestial/ornaments";

/* ── 모양 ─────────────────────────────────────────────────────────── */

const rise = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Panel = styled.div`
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 500;
    width: 290px;
    padding: 14px 16px 16px;
    background-color: ${p => p.theme.colors.background};
    border: 1px solid ${p => p.theme.colors.primary};
    box-shadow: 0 0 18px ${p => p.theme.colors.primary}33;
    animation: ${rise} 0.35s ease-out both;
`;

export const Corner = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    background: linear-gradient(315deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
    pointer-events: none;

    /* Celestial: 사선 대신 네 갈래 별 */
    ${celestialOnly(css`
        top: 6px;
        left: 6px;
        ${star4Mark("9px")}
        color: ${p => p.theme.colors.primary};
    `)}
`;

export const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

export const Label = styled.span`
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.textSecondary};
`;

export const CloseBtn = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    color: ${p => p.theme.colors.textSecondary};
    &:hover { color: ${p => p.theme.colors.text}; }
`;

export const Version = styled.div`
    margin-top: 6px;
    font-family: ${p => p.theme.fonts.display};
    font-size: 1rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
`;

export const Notes = styled.ul`
    margin: 8px 0 0;
    padding-left: 16px;
    max-height: 132px;
    overflow-y: auto;
    font-size: 0.76rem;
    line-height: 1.5;
    color: ${p => p.theme.colors.text};

    li + li { margin-top: 3px; }
    li::marker { color: ${p => p.theme.colors.primary}; }
`;

export const Desc = styled.p`
    margin: 8px 0 0;
    font-size: 0.78rem;
    line-height: 1.5;
    color: ${p => p.theme.colors.textSecondary};
`;

export const Row = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
`;

export const GhostBtn = styled.button`
    padding: 6px 12px;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.text};
    cursor: pointer;
    transition: border-color 0.15s;
    &:hover { border-color: ${p => p.theme.colors.primary}; }
`;

export const PrimaryBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.text};
    cursor: pointer;
    transition: box-shadow 0.15s;
    &:hover { box-shadow: 0 0 8px ${p => p.theme.colors.primary}66; }
`;

export const Rail = styled.div`
    margin-top: 12px;
    height: 1px;
    background: ${p => p.theme.colors.primary}33;
`;

export const Fill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    box-shadow: 0 0 6px ${p => p.theme.colors.primary};
    transition: width 0.2s ease;
`;
