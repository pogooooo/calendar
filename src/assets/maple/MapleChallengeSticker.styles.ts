/**
 * MapleChallengeSticker 의 모양 — 빈 칸은 옅은 동그라미에 회차 번호, 채운 칸은 단풍 붉은 동그라미에 단풍잎(벡터, ink.ts 의 crest).
 * 채워질 때는 도장을 찍듯 살짝 커졌다가 내려앉는다. 그림 파일은 쓰지 않는다.
 */
import styled, { keyframes, css } from "styled-components";
import { crest, hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export const stamp = keyframes`
    0%   { transform: scale(1.35) rotate(-8deg); opacity: 0; }
    60%  { transform: scale(0.94) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

export const Sticker = styled.div<{ $on: boolean; $animate: boolean; $tilt: number }>`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: ${(p) => (p.$on ? p.theme.colors.primary : hair(p.theme, p.theme.mode === "dark" ? 0.07 : 0.05))};
    box-shadow: ${(p) => (p.$on
        ? `0 1px 2px ${withAlpha(p.theme.colors.primary, 0.35)}, inset 0 -2px 0 rgba(0, 0, 0, 0.08)`
        : `inset 0 0 0 1px ${hair(p.theme, p.theme.mode === "dark" ? 0.1 : 0.08)}`)};
    transition: background-color 0.25s ease, box-shadow 0.25s ease;
    ${(p) => p.$on && p.$animate && css`animation: ${stamp} 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.2) both;`}

    /* 회차 번호 — 빈 칸에만 */
    .num {
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: ${(p) => (p.$on ? 0 : 1)};
        transition: opacity 0.2s ease;
    }

    /* 붙인 잎 — 카드 바탕색으로 오려 낸 단풍잎 */
    .leaf {
        position: absolute;
        top: 50%;
        left: 50%;
        ${crest("46%")}
        margin: -23% 0 0 -23%;
        color: ${(p) => p.theme.colors.surface};
        transform: rotate(${(p) => p.$tilt}deg);
        opacity: ${(p) => (p.$on ? 1 : 0)};
        transition: opacity 0.2s ease;
    }
`;
