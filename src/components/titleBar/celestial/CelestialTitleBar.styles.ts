/**
 * 데스크톱 창 제목 줄의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled from "styled-components";

/* ── 모양 ─────────────────────────────────────────────────────────── */

export const Bar = styled.div`
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0 16px;
    background-color: ${(p) => p.theme.colors.background};
    border-bottom: 1px solid ${(p) => p.theme.line ?? p.theme.colors.primary}33;
    user-select: none;
    -webkit-user-select: none;
`;

export const Title = styled.span`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 0.7rem;
    letter-spacing: 3px;
    color: ${(p) => p.theme.colors.primary};
    pointer-events: none;
`;

export const Controls = styled.div`
    display: flex;
    height: 100%;
`;

export const Btn = styled.button`
    width: 46px;
    height: 100%;
    background: transparent;
    border: none;
    color: ${(p) => p.theme.colors.text};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
        background-color: ${(p) => p.theme.colors.primary}22;
    }
`;

export const CloseBtn = styled(Btn)`
    &:hover {
        background-color: #C42B1C;
        color: #ffffff;
    }
`;
