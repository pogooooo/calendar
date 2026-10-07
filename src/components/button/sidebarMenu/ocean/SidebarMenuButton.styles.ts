/**
 * 바다의 사이드바 단추 — 모래 위에 놓인 것들. 금빛 실선과 양 끝 별(Celestial), 색인 쪽 번호와 잎(Maple) 대신:
 *   글씨는 바랜 유목 갈색, 올리면 모래가 젖어 살짝 어두워지고,
 *   고른 자리는 물에 닳은 바다유리 조각(청록 반투명 알약)이 되며, 쪽 번호 자리에 작은 불가사리가 앉는다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { R, sandInk, starfishImage } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/SidebarMenuButton.styles";

/** 쪽 번호 대신 — 평소엔 모래 속 작은 조개 조각(점), 고르면 불가사리 */
export const Numeral = styled(C.Numeral)`
    font-size: 0;
    letter-spacing: 0;
    width: 6px;
    height: 6px;
    margin-right: 14px;
    border-radius: 50%;
    opacity: 1;
    background: ${(p) => withAlpha(sandInk(p.theme), 0.28)};
    transform: scale(0.8);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, width 0.3s ease, height 0.3s ease;
`;

export const SidebarButton = styled(C.SidebarButton)`
    border-radius: ${R.pill};
    padding: 0 6px 0 4px;
    color: ${(p) => sandInk(p.theme)};
    background-image: none;
    font-family: ${(p) => p.theme.fonts.display};
    border: 1px solid transparent;
    transition: background-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, border-color 0.25s ease;

    &::before, &::after { display: none; }
    svg { color: ${(p) => sandInk(p.theme, true)}; transition: color 0.25s ease, transform 0.3s ease; }

    /* 젖은 모래 */
    &:hover {
        background-size: 0;
        background-color: ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.16)" : "rgba(150, 110, 60, 0.1)")};
    }
    &:hover svg { color: ${(p) => sandInk(p.theme)}; }
    &:hover ${C.Numeral} { transform: scale(1.1); background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)}; }

    /* 바다유리 조각 */
    ${(p) => p.$active && css`
        color: ${p.theme.mode === "dark" ? "#E7FFFC" : "#0B4F58"};
        font-weight: 700;
        border-color: ${p.theme.mode === "dark" ? "rgba(127, 245, 234, 0.35)" : "rgba(255, 255, 255, 0.85)"};
        background: ${p.theme.mode === "dark"
            ? "linear-gradient(135deg, rgba(60, 190, 190, 0.38), rgba(20, 110, 125, 0.32))"
            : "linear-gradient(135deg, rgba(178, 240, 232, 0.9), rgba(110, 214, 208, 0.62))"};
        box-shadow: 0 6px 14px -6px ${p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(10, 110, 120, 0.55)"},
            inset 0 1px 0 ${p.theme.mode === "dark" ? "rgba(160, 250, 240, 0.3)" : "rgba(255, 255, 255, 0.95)"},
            inset 0 -6px 12px -8px ${p.theme.mode === "dark" ? "rgba(111, 227, 218, 0.4)" : "rgba(14, 140, 150, 0.45)"};
        svg { color: ${p.theme.mode === "dark" ? "#9FF5EC" : "#0E7C86"}; }
        &:hover { background-color: transparent; }
        ${C.Numeral}, &:hover ${C.Numeral} {
            width: 14px;
            height: 14px;
            border-radius: 0;
            transform: rotate(-12deg) scale(1);
            background: ${starfishImage("amber")} center / contain no-repeat;
        }
    `}
`;
