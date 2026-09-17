/**
 * MapleChallengeSticker 의 모양 — 톱니 테두리 잎 스티커(C11 윤곽 → C12 채움).
 * 채워질 때는 도장을 찍듯 살짝 커졌다가 내려앉는다.
 */
import styled, { keyframes, css } from "styled-components";
import { inkMask } from "@/styles/maple/ink";

export const stamp = keyframes`
    0%   { transform: scale(1.35) rotate(-8deg); opacity: 0; }
    60%  { transform: scale(0.94) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

export const Sticker = styled.div<{ $on: boolean; $animate: boolean }>`
    position: relative;
    width: 100%;
    height: 100%;
    color: ${(p) => p.theme.colors.text};

    .outline, .filled {
        position: absolute;
        inset: 0;
    }

    .outline {
        ${inkMask("sticker-outline.webp")}
        opacity: ${(p) => (p.$on ? 0 : 0.55)};
        transition: opacity 0.3s ease;
    }

    .filled {
        ${inkMask("sticker-filled.webp")}
        background-color: ${(p) => p.theme.colors.primary};
        opacity: ${(p) => (p.$on ? 1 : 0)};
        transition: opacity 0.3s ease;
        ${(p) => p.$on && p.$animate && css`animation: ${stamp} 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.2) both;`}
    }
`;
