/**
 * Celestial 의 재료 — 금박(gilt)과 그 위를 스치는 빛(sheen).
 *
 * 금빛을 납작한 한 색(#D4AF37)으로 칠하면 노란 물감으로 읽혔다 — 금속은 밝은 결과 그늘이 섞여야 금속으로 읽힌다.
 * 그래서 "채운 금"은 모두 이 금박을 쓴다: 주 단추·오늘 표시·떠 있는 + 단추 같은 것. 선(테두리·괘선)은 그대로 한 색.
 * 금박 위 글씨는 흰색이 아니라 짙은 먹(giltInk) — 흰 글씨는 금 위에서 대비가 2:1 남짓이라 흐렸다.
 */
import { css } from "styled-components";
import type { DefaultTheme } from "styled-components";

const dark = (t: DefaultTheme) => t.mode === "dark";

/** 금박 위의 글씨·아이콘 색 */
export const giltInk = (t: DefaultTheme) => (dark(t) ? "#1B1608" : "#3B2E0C");

/** 금박 면 — 밝은 결·그늘이 가로로 엇갈리는 금속 + 위는 빛, 아래는 그늘이 맺힌 가장자리.
 *  결은 곧게(위→아래) — Celestial 은 비스듬한 선을 쓰지 않는다 */
export const gilt = css`
    background-color: ${(p) => p.theme.colors.primary};
    background-image: ${(p) => dark(p.theme)
        ? "linear-gradient(180deg, #F7E7B6 0%, #D9BD78 34%, #B39652 58%, #EBD497 82%, #CDB06C 100%)"
        : "linear-gradient(180deg, #F3DD8E 0%, #D4AF37 34%, #B08A24 58%, #E8C96A 82%, #C9A23A 100%)"};
    box-shadow: inset 0 1px 0 rgba(255, 248, 220, ${(p) => (dark(p.theme) ? 0.55 : 0.7)}), inset 0 -1px 0 rgba(110, 80, 10, 0.3);
    color: ${(p) => giltInk(p.theme)};
`;

/** 작은 금박(알약·점) — 비스듬한 결은 작은 면에서 한쪽 끝이 바탕에 녹아 잘린 것처럼 보였다. 위는 밝고 아래는 짙게 */
export const giltSmall = css`
    background-color: ${(p) => p.theme.colors.primary};
    background-image: ${(p) => dark(p.theme)
        ? "linear-gradient(180deg, #F3E1A8 0%, #D9BD78 55%, #BFA060 100%)"
        : "linear-gradient(180deg, #EFD584 0%, #D4AF37 55%, #B38C25 100%)"};
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
