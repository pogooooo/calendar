/**
 * 바다의 독 단추 — 44px 네모(12px 모서리) 안에 20px 아이콘 하나. 이름은 단추 위에 뜨는 작은 꼬리표
 * (올리거나 키보드로 오면 4px 떠오르며 나타난다). 손가락 화면(hover 없음)에서는 꼬리표 대신 아이콘 밑에 늘 보인다.
 * 고른 단추 = 청록 아이콘 + 옅은 청록 면 + 밑의 4px 점. 올리면 옅게 칠해지고 아이콘이 1px 뜬다, 누르면 살짝 눌린다.
 * Celestial 의 금빛 밑줄·양 끝 별, Maple 의 색인 쪽 번호·잎 대신. 쪽 번호(Numeral)는 없다.
 * 고른 표시는 $active 또는 aria-current="page" — 홈·설정(Profile 쪽 단추)은 aria-current 로만 안다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { EASE, focusRing, ink } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/SidebarMenuButton.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 쪽 번호 — 바다에는 없다 */
export const Numeral = styled(C.Numeral)`
    display: none;
`;

export const IconContainer = styled(C.IconContainer)`
    width: 20px;
    height: 20px;
    margin: 0;
`;

/** 고른 단추 */
const chosen = css`
    color: ${(p) => p.theme.colors.primary};
    background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1)};
    &::after { opacity: 1; }
    &:hover {
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.2 : 0.14)};
    }
`;

export const SidebarButton = styled(C.SidebarButton)`
    flex: none;
    width: 44px;
    height: 44px;
    padding: 0;
    gap: 0;
    justify-content: center;
    border: none;
    border-radius: 12px;
    color: ${(p) => p.theme.colors.textSecondary};
    background-color: transparent;
    background-image: none;
    font-family: ${(p) => p.theme.fonts.body};
    transition: background-color 0.15s ease, color 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    svg { width: 20px; height: 20px; stroke-width: 1.75; transition: transform 0.2s ${EASE}; }

    /* 별 자리 — ::before 는 비우고(설정 앞의 선으로 빌려 쓴다), ::after 는 고른 단추 밑의 점 */
    &::before { display: none; }
    &::after {
        left: calc(50% - 2px);
        right: auto;
        bottom: 4px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        clip-path: none;
        background-color: ${(p) => p.theme.colors.primary};
        transform: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    /* 이름 — 단추 위에 뜨는 꼬리표 */
    & > span {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 12px);
        margin: 0;
        padding: 5px 9px;
        border-radius: 7px;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: -0.005em;
        white-space: nowrap;
        max-width: none;
        overflow: visible;
        color: ${(p) => (dark(p) ? "#0B1716" : "#FFFFFF")};
        background-color: ${(p) => (dark(p) ? "rgba(229, 236, 234, 0.95)" : "rgba(18, 33, 32, 0.9)")};
        box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        opacity: 0;
        transform: translate(-50%, 4px);
        transition: opacity 0.12s ease, transform 0.18s ${EASE};
    }

    &:hover {
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.055)};
    }
    &:hover svg { transform: translateY(-1px); }
    &:active svg { transform: scale(0.92); }
    &:hover > span, &:focus-visible > span {
        opacity: 1;
        transform: translate(-50%, 0);
        transition-delay: 0.06s;
    }
    ${focusRing}

    ${(p) => p.$active && chosen}
    &[aria-current="page"] { ${chosen} }

    /* 손가락 화면 — 꼬리표 대신 아이콘 밑에 늘 이름 (고른 표시는 면 색으로) */
    @media (hover: none) {
        width: 60px;
        height: 50px;
        flex-direction: column;
        gap: 3px;

        & > span {
            position: static;
            padding: 0;
            font-size: 0.625rem;
            color: inherit;
            background: none;
            box-shadow: none;
            opacity: 1;
            transform: none;
        }
        &::after { display: none; }
        &:hover svg { transform: none; }
    }
`;
