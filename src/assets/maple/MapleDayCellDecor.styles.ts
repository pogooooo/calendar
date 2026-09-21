/**
 * MapleDayCellDecor 의 모양 — 바쁜 날일수록 종이가 황토빛으로 물든다.
 * 1단계: 옅은 물, 2단계: 더 짙게, 3단계: 먹 하이라인 틀까지.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";

export const appear = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

export const Wash = styled.div<{ $level: number; $left: boolean; $right: boolean }>`
    position: absolute;
    inset: 3px;
    left: ${(p) => (p.$left ? "0" : "3px")};
    right: ${(p) => (p.$right ? "0" : "3px")};
    pointer-events: none;
    z-index: 0;
    animation: ${appear} 0.55s ease-out both;
    background: ${(p) => withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.03 + p.$level * 0.03 : 0.035 + p.$level * 0.03)};
    border: 1px solid ${(p) => (p.$level >= 3 ? withAlpha(p.theme.colors.text, 0.28) : "transparent")};
    border-left-color: ${(p) => (p.$left ? "transparent" : undefined)};
    border-right-color: ${(p) => (p.$right ? "transparent" : undefined)};
`;
