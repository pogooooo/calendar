/**
 * 바다의 사이드바 단추 — 알약 모양 물길. 금빛 실선과 양 끝 별(Celestial), 색인 쪽 번호와 잎(Maple) 대신
 * 고른 자리가 유리 물방울로 떠오르고, 로마 숫자 자리에는 진주가 하나 맺힌다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { R } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/SidebarMenuButton.styles";

/** 쪽 번호 대신 진주 — 고르거나 올리면 맺힌다 */
export const Numeral = styled(C.Numeral)`
    font-size: 0;
    letter-spacing: 0;
    width: 7px;
    height: 7px;
    margin-right: 14px;
    border-radius: 50%;
    opacity: 1;
    background: radial-gradient(circle at 35% 30%, #FFFFFF 0 20%, transparent 45%), ${(p) => withAlpha(p.theme.colors.primary, 0.18)};
    transform: scale(0.6);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease;
`;

export const SidebarButton = styled(C.SidebarButton)`
    border-radius: ${R.pill};
    padding: 0 6px 0 4px;
    background-image: none;
    font-family: ${(p) => p.theme.fonts.display};
    transition: background-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;

    &::before, &::after { display: none; }

    &:hover {
        background-size: 0;
        background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)};
    }
    &:hover ${Numeral} { transform: scale(0.85); background-color: ${(p) => p.theme.colors.accent}; }

    ${(p) => p.$active && css`
        color: ${p.theme.colors.primary};
        font-weight: 700;
        background-color: ${withAlpha(p.theme.mode === "dark" ? p.theme.colors.primary : "#FFFFFF", p.theme.mode === "dark" ? 0.12 : 0.8)};
        box-shadow: 0 4px 14px ${withAlpha(p.theme.colors.primary, 0.16)}, inset 0 1px 0 rgba(255, 255, 255, 0.7);
        ${Numeral} {
            transform: scale(1);
            background: radial-gradient(circle at 35% 30%, #FFFFFF 0 22%, transparent 45%), ${p.theme.colors.primary};
        }
    `}
`;
