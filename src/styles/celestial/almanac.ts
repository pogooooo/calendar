/**
 * Celestial 의 재료 — 금박(gilt)과 그 위를 스치는 빛(sheen).
 *
 * 주요 버튼은 단색 금색을 쓰고, 작은 장식의 금박 재질은 별도로 유지한다.
 * 금색 면 위에는 낮과 밤 모두 짙은 먹을 쓴다.
 */
import { css } from "styled-components";
import type { DefaultTheme } from "styled-components";

const dark = (t: DefaultTheme) => t.mode === "dark";

/** 금박 위의 글씨·아이콘 색 */
export const giltInk = (t: DefaultTheme) => (dark(t) ? "#1B1608" : "#352A10");

/** 주요 행동의 단색 금색 면. 버튼의 명암 그라데이션은 사용하지 않는다. */
export const gilt = css`
    background-color: ${(p) => p.theme.colors.primary};
    background-image: none;
    box-shadow: none;
    color: ${(p) => giltInk(p.theme)};
`;

/** 작은 금박(알약·점) — 비스듬한 결은 작은 면에서 한쪽 끝이 바탕에 녹아 잘린 것처럼 보였다. 위는 밝고 아래는 짙게 */
export const giltSmall = css`
    background-color: ${(p) => p.theme.colors.primary};
    background-image: ${(p) => dark(p.theme)
        ? "linear-gradient(180deg, #F3E1A8 0%, #D9BD78 55%, #BFA060 100%)"
        : "linear-gradient(180deg, #E6CB76 0%, #D4AF37 55%, #BE982F 100%)"};
    color: ${(p) => giltInk(p.theme)};
`;

/** 올리면 금박 위로 곧은 빛줄기가 한 번 가로질러 스친다 (끝없이 돌지 않는다). ::after 를 쓴다 — 그 자리를 쓰는 요소에는 붙이지 말 것 */
export const sheen = css`
    position: relative;
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 30%, rgba(255, 252, 235, 0.55) 48%, rgba(255, 252, 235, 0.1) 56%, transparent 66%);
        transform: translateX(-130%);
        pointer-events: none;
    }

    @media (hover: hover) {
        :where(html:not([data-theme-motion="off"])) &::after { transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        :where(html:not([data-theme-motion="off"])) &:hover:not(:disabled)::after { transform: translateX(130%); }
    }
`;
