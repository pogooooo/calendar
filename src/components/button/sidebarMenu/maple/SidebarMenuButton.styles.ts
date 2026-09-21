/**
 * Maple 의 사이드바 메뉴 단추 — 색인의 한 줄 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * Celestial 은 마우스를 올리면 금빛 밑줄이 자라고 양끝에 별이 핀다. Maple 은 줄 앞에 잎이 하나 돋고
 * 종이에 황토 물이 든다. 고른 줄은 붉은 잎과 붉은 글씨.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { withAlpha } from "@/styles/color";
import { leafBullet } from "@/styles/maple/ink";

export * from "../celestial/SidebarMenuButton.styles";

export const Numeral = styled(C.Numeral)`
    margin-right: 6px;
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    opacity: 0.6;
`;

export const SidebarButton = styled(C.SidebarButton)`
    padding: 0 2px 0 16px;
    border-radius: 2px;
    background-image: none;
    transition: background-color 0.18s ease, color 0.18s ease;

    & > span {
        font-family: ${(p) => p.theme.fonts.display};
        letter-spacing: 0.04em;
        transition: color 0.18s ease;
    }

    /* 줄 앞의 잎: 평소엔 숨고, 올리면 윤곽, 고르면 붉게 채운 잎 */
    &::before {
        left: 2px;
        right: auto;
        bottom: auto;
        top: 50%;
        ${leafBullet(false, "11px")}
        background-color: ${(p) => p.theme.colors.textSecondary};
        clip-path: none;
        opacity: 0;
        transform: translateY(-50%) scale(0.6);
        transition: opacity 0.18s ease, transform 0.18s ease;
    }

    &::after { display: none; }

    &:hover {
        background-size: 0 0;
        background-color: ${(p) => withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.12 : 0.2)};
    }

    &:hover::before {
        opacity: 0.8;
        transform: translateY(-50%) scale(1);
    }

    ${(p) => p.$active && css`
        background-size: 0 0;
        color: ${p.theme.colors.primary};

        & > span { color: ${p.theme.colors.primary}; }

        &::before,
        &:hover::before {
            ${leafBullet(true, "11px")}
            background-color: ${p.theme.colors.primary};
            opacity: 1;
            transform: translateY(-50%) scale(1);
        }
    `}
`;
