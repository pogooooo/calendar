/**
 * 위젯의 '로그인해 주세요' 안내 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled from "styled-components";

/* ── 모양 ─────────────────────────────────────────────────────────── */

export const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 100%;
    min-height: 90px;
    font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    text-align: center;
`;

export const Sub = styled.span`
    font-size: 0.7rem;
    opacity: 0.75;
`;
