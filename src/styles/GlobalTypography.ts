import { createGlobalStyle } from "styled-components";

export const FONT_SIZE_OPTIONS = [
    { key: "sm", label: "작게", px: 14 },
    { key: "md", label: "기본", px: 16 },
    { key: "lg", label: "크게", px: 18 },
    { key: "xl", label: "아주 크게", px: 20 },
] as const;

export const FONT_WEIGHT_OPTIONS = [
    { key: "light", label: "가늘게", weight: 300 },
    { key: "normal", label: "기본", weight: 0 },
    { key: "bold", label: "굵게", weight: 600 },
] as const;

export type FontSizeKey = typeof FONT_SIZE_OPTIONS[number]["key"];
export type FontWeightKey = typeof FONT_WEIGHT_OPTIONS[number]["key"];

export const getFontSize = (key: string | undefined) =>
    FONT_SIZE_OPTIONS.find(o => o.key === key) ?? FONT_SIZE_OPTIONS[1];

export const getFontWeight = (key: string | undefined) =>
    FONT_WEIGHT_OPTIONS.find(o => o.key === key) ?? FONT_WEIGHT_OPTIONS[1];

// 두께 0 은 "각 요소가 정한 두께를 그대로 둔다"는 뜻이라 규칙을 아예 내보내지 않는다.
const GlobalTypography = createGlobalStyle<{ $sizePx: number; $weight: number }>`
    html {
        font-size: ${(props) => props.$sizePx}px;
    }

    html[data-drag-active], html[data-drag-active] * {
        cursor: grabbing !important;
        user-select: none !important;
    }

    :where(button, a, input, textarea, select, [tabindex]):focus-visible {
        outline: 2px solid ${(props) => props.theme.colors.primary};
        outline-offset: 3px;
    }

    /* 기기의 동작 줄이기는 data-theme-motion 이 담는다 — 따르면 off(첫 그림 스크립트·ThemeProviderWrapper),
       설정에서 '그래도 움직이기'를 켰으면 고른 값. 그래서 여기서는 그 값만 본다 */
    html[data-theme-motion="off"] *,
    html[data-theme-motion="off"] *::before,
    html[data-theme-motion="off"] *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
    }

    html[data-theme-motion="off"] [data-page-transition-overlay] {
        display:none !important;
    }

    html[data-page-hidden] [data-ambient],
    html[data-page-hidden] [data-ambient] *,
    html[data-drag-active] [data-ambient],
    html[data-drag-active] [data-ambient] * {
        animation-play-state: paused !important;
    }

    ${(props) => props.$weight > 0 && `
        body,
        body p, body span, body div, body li, body td, body th,
        body label, body strong, body em, body small,
        body h1, body h2, body h3, body h4, body h5, body h6,
        body a, body button, body input, body textarea, body select {
            font-weight: ${props.$weight};
        }
    `}

    @media (max-width: 768px) {
        input,
        textarea,
        select {
            font-size: max(16px, 1rem);
        }
    }
`;

export default GlobalTypography;
