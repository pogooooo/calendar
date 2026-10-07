/**
 * 바다의 프로젝트 머리 — 금빛 실선 위 네모 단추·네모 탭(Celestial), 먹선 쪽지(Maple) 대신
 * 굵은 제목 하나와 옆의 작은 카테고리 꼬리표(색 점), 오른쪽의 단추 둘("새 프로젝트"는 청록).
 * 프로젝트 탭은 밑줄 탭 줄 — 머리카락 선 위에 글씨만, 고른 것은 진한 글씨와 2px 청록 밑줄.
 * 폰에서는 탭이 줄을 바꿔 쌓이므로 밑줄 대신 옅게 칠한 작은 칸으로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialProjectHeader.styles";
import { R, focusRing, hairline, ink, seaButton, surfaceIn, calm, EASE } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectHeader.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const HeaderWrapper = styled(C.HeaderWrapper)`
    animation: ${surfaceIn} 0.4s ${EASE} both;
    ${calm}
`;

export const Header = styled(C.Header)`
    margin-bottom: 14px;
    ${MOBILE} { margin-bottom: 10px; }
`;

export const HeaderTitle = styled(C.HeaderTitle)`
    gap: 10px;
`;

/** 제목 — 22px 굵은 글씨 */
export const TitleText = styled(C.TitleText)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: ${(p) => p.theme.colors.text};

    ${MOBILE} { font-size: 1.2rem; }
`;

/** 카테고리 — 테두리 상자 대신 옅게 칠한 6px 꼬리표, 앞에 그 카테고리 색 점 */
export const CategoryTag = styled(C.CategoryTag)`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border: none;
    border-radius: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};

    &::before {
        content: "";
        width: 6px;
        height: 6px;
        flex: none;
        border-radius: 50%;
        background: ${(p) => p.$color};
    }

    &::before { transform: none; }
`;

/** 실선은 두지 않는다 — 제목과 단추 사이는 빈 자리 */
export const HeaderLine = styled(C.HeaderLine)`
    border: none;
    visibility: hidden;
`;

export const HeaderActions = styled(C.HeaderActions)`
    gap: 8px;
`;

/** 단추 — 흰 면에 선 하나. 맨 끝("새 프로젝트")은 청록 */
export const HeaderActionButton = styled(C.HeaderActionButton)`
    ${seaButton("default")}
    height: 36px;
    padding: 0 14px;
    font-size: 0.8125rem;
    letter-spacing: -0.005em;

    &:hover { box-shadow: none; }
    &:last-child { ${seaButton("primary")} }

    ${MOBILE} { height: 40px; padding: 0 8px; font-size: 0.8125rem; letter-spacing: 0; }
`;

/** 탭 줄 — 아래로 머리카락 선 하나, 그 위에 글씨 탭 */
export const TabContainer = styled(C.TabContainer)`
    gap: 22px;
    margin-bottom: 16px;
    padding: 0 2px;
    box-shadow: inset 0 -1px 0 ${(p) => hairline(p.theme)};
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    ${MOBILE} {
        gap: 4px;
        max-height: 92px;
        margin-bottom: 12px;
        padding: 0;
        box-shadow: none;
    }
`;

/** 탭 — 글씨만. 고르면 진한 글씨와 2px 청록 밑줄 (폰: 옅게 칠한 칸) */
export const Tab = styled(C.Tab)`
    position: relative;
    flex: none;
    min-height: 40px;
    padding: 0 1px;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: ${(p) => (p.$active ? `inset 0 -2px 0 ${p.theme.colors.primary}` : "none")};
    transition: box-shadow 0.15s ease, color 0.15s ease, background-color 0.15s ease;

    span {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.875rem;
        font-weight: ${(p) => (p.$active ? 600 : 500)};
        letter-spacing: -0.01em;
        color: ${(p) => (p.$active ? p.theme.colors.text : p.theme.colors.textSecondary)};
        transition: color 0.15s ease;
    }

    &:hover {
        border-color: transparent;
        box-shadow: ${(p) => (p.$active ? `inset 0 -2px 0 ${p.theme.colors.primary}` : `inset 0 -2px 0 ${hairline(p.theme, true)}`)};
        span { color: ${(p) => p.theme.colors.text}; }
    }
    ${focusRing}

    ${MOBILE} {
        flex: 0 1 auto;
        min-height: 44px;
        padding: 0 12px;
        border-radius: ${R.sm};
        box-shadow: none;
        ${(p) => p.$active && css`background: ${withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1)};`}
        &:hover { box-shadow: none; }
        &:active { background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)}; }
    }

    /* 고른 꼬리표 밑 마름모는 Celestial 만 */
    &::after { display: none; }
`;

export const TabText = styled(C.TabText)`
    white-space: nowrap;
`;
