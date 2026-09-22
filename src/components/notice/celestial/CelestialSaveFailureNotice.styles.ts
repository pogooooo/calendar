/**
 * 저장 실패 알림 띠의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { keyframes } from "styled-components";
import { MOBILE, TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

/* ── 모양 ─────────────────────────────────────────────────────────── */

const slideUp = keyframes`
    from { opacity: 0; transform: translate(-50%, 12px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
`;

export const Bar = styled.div`
    position: fixed;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    z-index: 1200;

    display: flex;
    align-items: center;
    gap: 10px;
    max-width: min(560px, calc(100vw - 32px));
    padding: 10px 12px 10px 14px;

    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => p.theme.colors.error};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
    color: ${(p) => p.theme.colors.text};

    svg { flex: none; color: ${(p) => p.theme.colors.error}; }

    .msg {
        flex: 1;
        min-width: 0;
        font-size: 0.82rem;
        line-height: 1.5;
    }

    button {
        flex: none;
        display: flex;
        padding: 4px;
        background: none;
        border: none;
        cursor: pointer;
        color: ${(p) => p.theme.colors.textSecondary};

        &:hover { color: ${(p) => p.theme.colors.text}; }
    }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${slideUp} 0.22s ease-out both;
    }

    /* 폰에서는 탭바를 피해 그 위에 뜬다 */
    ${MOBILE} {
        bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B} + 14px);
        left: 12px;
        right: 12px;
        transform: none;
        max-width: none;

        @media (prefers-reduced-motion: no-preference) {
            animation: none;
        }
    }
`;
