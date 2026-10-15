/**
 * Maple 의 사이드바 메뉴 단추 — 목차의 한 줄. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 둥근 줄 하나. 올리면 옅은 바탕이 깔리고, 고른 줄(지금 화면)은 단풍 붉음을 옅게 깐 바탕에 붉은 그림·글씨.
 * 2026-10-15 다시 그리며 로마 숫자 쪽 번호·목차 점선·줄 앞에 돋던 잎을 걷었다 — 작은 장식이 줄마다 셋씩 붙어 어수선했다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/SidebarMenuButton.styles";

export const Numeral = styled(C.Numeral)`
    display: none;
`;

/** 그림은 줄 머리에 바짝 */
export const IconContainer = styled(C.IconContainer)`
    margin-left: 0;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: color 0.15s ease;
`;

/** 고른 줄 — 메뉴 칸은 $active 로, 프로필 칸의 홈·설정은 aria-current 로 온다 */
const active = css`
    background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.16 : 0.1)};
    color: ${(p) => p.theme.colors.primary};

    & > span { font-weight: 600; }
    ${IconContainer} { color: ${(p) => p.theme.colors.primary}; }

    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.2 : 0.13)}; }
`;

export const SidebarButton = styled(C.SidebarButton)`
    height: 38px;
    padding: 0 10px;
    gap: 10px;
    border-radius: 10px;
    color: ${(p) => p.theme.colors.text};
    font-size: 0.9rem;
    background-image: none;
    transition: background-color 0.15s ease, color 0.15s ease;

    & > span {
        margin-left: 0;
        font-weight: 500;
        letter-spacing: 0;
    }

    &::before, &::after { display: none; }

    &:hover {
        background-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.07 : 0.05)};
    }
    &:hover ${IconContainer} { color: ${(p) => p.theme.colors.text}; }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.45)};
    }

    ${(p) => p.$active && active}
    &[aria-current="page"] { ${active} }

    svg { width: 19px; height: 19px; stroke-width: 1.75; }
`;
