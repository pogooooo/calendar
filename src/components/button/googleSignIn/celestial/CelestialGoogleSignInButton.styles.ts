/**
 * 구글 로그인 단추의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled from "styled-components";

/* ── 모양 ─────────────────────────────────────────────────────────── */

export const Btn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 300px;
    height: 40px;
    padding: 0 12px;
    background: #ffffff;
    border: 1px solid #dadce0;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(60, 64, 67, 0.12);
    transition: background 0.15s, box-shadow 0.15s;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background: #f8f9fa;
        box-shadow: 0 2px 6px rgba(60, 64, 67, 0.20);
    }

    &:active:not(:disabled) {
        background: #f1f3f4;
        box-shadow: none;
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;

export const GoogleLogo = styled.svg`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
`;

export const Label = styled.span`
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #3c4043;
    letter-spacing: 0.25px;
    white-space: nowrap;
`;
