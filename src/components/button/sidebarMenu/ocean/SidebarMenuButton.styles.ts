/**
 * 바다의 사이드바 단추 — 36px 줄 하나. 금빛 실선과 양 끝 별(Celestial), 색인 쪽 번호와 잎(Maple) 대신
 * 올리면 옅게 칠하고, 고른 줄은 옅은 청록 면에 글씨·아이콘이 청록으로. 쪽 번호 자리는 비운다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { focusRing, ink } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/SidebarMenuButton.styles";

/** 쪽 번호 — 바다에는 없다 (고른 줄은 면 색으로 충분하다) */
export const Numeral = styled(C.Numeral)`
    display: none;
`;

export const SidebarButton = styled(C.SidebarButton)`
    height: 36px;
    border-radius: 10px;
    padding: 0 8px 0 4px;
    gap: 6px;
    color: ${(p) => p.theme.colors.textSecondary};
    background-image: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9rem;
    font-weight: 500;
    border: none;
    transition: background-color 0.15s ease, color 0.15s ease;

    &::before, &::after { display: none; }
    & > span { margin-left: 4px; }
    svg { width: 18px; height: 18px; stroke-width: 1.75; transition: color 0.15s ease; }

    &:hover {
        background-size: 0;
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.07 : 0.045)};
    }
    ${focusRing}

    ${(p) => p.$active && css`
        color: ${p.theme.colors.primary};
        font-weight: 600;
        background-color: ${withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.14 : 0.09)};
        &:hover { color: ${p.theme.colors.primary}; background-color: ${withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.18 : 0.12)}; }
    `}
`;
