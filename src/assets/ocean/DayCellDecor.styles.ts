/**
 * 바다의 달력 칸 꾸밈 — 칸 바닥의 2px 청록 선. 단계(1~3)에 따라 30% → 55% → 90% 로 짙어진다.
 * 이어지는 쪽은 칸 끝까지, 끊기는 쪽은 8px 안쪽에서 둥글게 끝난다.
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";

const STRENGTH = [0, 0.3, 0.55, 0.9];

export const Line = styled.span<{ $tier: number; $left: boolean; $right: boolean }>`
    position: absolute;
    left: ${(p) => (p.$left ? "0" : "8px")};
    right: ${(p) => (p.$right ? "0" : "8px")};
    bottom: 3px;
    height: 2px;
    z-index: 0;
    pointer-events: none;
    border-radius: ${(p) => `${p.$left ? 0 : 2}px ${p.$right ? 0 : 2}px ${p.$right ? 0 : 2}px ${p.$left ? 0 : 2}px`};
    background-color: ${(p) => withAlpha(p.theme.colors.primary, STRENGTH[Math.min(3, Math.max(1, p.$tier))])};
`;
