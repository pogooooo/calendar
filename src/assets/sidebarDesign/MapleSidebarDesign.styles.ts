/**
 * MapleSidebarDesign 의 모양.
 *
 * 세로 먹선 하나에 단풍 가지(E6)가 걸려 있다. 가지는 늘 아주 느리게 흔들리고,
 * 옆선에 마우스를 올리면 바람이 분 듯 조금 더 크게 흔들린다.
 */
import styled, { keyframes, css } from "styled-components";
import { withAlpha } from "@/styles/color";

export const sway = keyframes`
    0%, 100% { transform: rotate(-1.2deg); }
    50% { transform: rotate(1.4deg); }
`;

export const gust = keyframes`
    0% { transform: rotate(-1.2deg); }
    30% { transform: rotate(3.2deg); }
    60% { transform: rotate(-2.4deg); }
    100% { transform: rotate(1.4deg); }
`;

export const Wrap = styled.div<{ $hovered?: boolean }>`
    position: relative;
    width: 160px;
    height: 100%;
    color: ${(p) => p.theme.colors.text};

    .rule {
        position: absolute;
        left: 102px;
        top: 0;
        width: 1px;
        height: 100%;
        background: linear-gradient(
            to bottom,
            transparent 0,
            ${(p) => withAlpha(p.theme.colors.text, 0.55)} 24px,
            ${(p) => withAlpha(p.theme.colors.text, 0.55)} calc(100% - 24px),
            transparent 100%
        );
        transition: background 0.3s ease;
    }

    ${(p) => p.$hovered && css`
        .rule {
            background: linear-gradient(
                to bottom,
                transparent 0,
                ${withAlpha(p.theme.colors.primary, 0.9)} 24px,
                ${withAlpha(p.theme.colors.primary, 0.9)} calc(100% - 24px),
                transparent 100%
            );
        }
    `}

    /* 가지: 먹선 위쪽에 걸린다. 회전축은 가지가 선에 붙은 자리 */
    .branch {
        position: absolute;
        left: 40px;
        top: 64px;
        width: 150px;
        transform-origin: 62% 4%;
        animation: ${sway} 7s ease-in-out infinite;
        filter: ${(p) => p.theme.mode === "dark" ? "brightness(0.92) saturate(0.9)" : "none"};
        pointer-events: none;
    }

    ${(p) => p.$hovered && css`
        .branch { animation: ${gust} 2.6s ease-in-out infinite; }
    `}

    /* 가지 아래 매듭: 선 위에 앉은 작은 도장 */
    .seal {
        position: absolute;
        left: 95px;
        top: 336px;
        width: 15px;
        height: 15px;
        background: ${(p) => p.theme.colors.primary};
        mask: url("/themes/maple/crest.webp") center / contain no-repeat;
        -webkit-mask: url("/themes/maple/crest.webp") center / contain no-repeat;
        opacity: 0.8;
    }
`;
