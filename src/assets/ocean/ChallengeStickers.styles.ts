/**
 * 바다의 챌린지 칸의 모양 — 빈 칸은 가는 선 동그라미에 고정폭 번호, 해낸 칸은 청록 동그라미에 흰 체크.
 * 바뀔 때 한 번만 살짝 커졌다 앉는다 (끝없는 움직임 없음, 움직임을 끄면 그것도 없다).
 */
import styled, { css, keyframes } from "styled-components";
import { EASE, MONO, calm, ink } from "@/styles/ocean/water";

const fill = keyframes`
    from { transform: scale(0.82); }
    to   { transform: scale(1); }
`;
const clear = keyframes`
    from { transform: scale(1.08); }
    to   { transform: scale(1); }
`;

export const Sticker = styled.span<{ $on: boolean; $animate: boolean }>`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 50%;
    border: 1.5px solid ${(p) => (p.$on ? p.theme.colors.primary : ink(p.theme, p.theme.mode === "dark" ? 0.22 : 0.16))};
    background-color: ${(p) => (p.$on ? p.theme.colors.primary : "transparent")};
    color: ${(p) => (p.$on ? (p.theme.mode === "dark" ? "#06110F" : "#FFFFFF") : p.theme.colors.textSecondary)};
    font-family: ${MONO};
    font-size: 0.66rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    user-select: none;
    transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
    ${(p) => p.$animate && css`
        animation: ${p.$on ? fill : clear} 0.28s ${EASE};
        ${calm}
    `}
`;
