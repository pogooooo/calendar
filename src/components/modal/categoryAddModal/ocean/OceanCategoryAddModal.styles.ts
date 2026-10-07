/**
 * 바다의 카테고리 창 — 금빛 실선 서식(Celestial), 먹선 종이(Maple) 대신
 * 16px·600 제목 밑과 단추 줄 위에만 머리카락 선, 28px 글자 단추 닫기, 상자 없는 "이름 + 칸" 줄.
 * 색 고르기는 머리카락 선 고리를 두른 24px 동그라미 하나, 옆의 색 번호는 작은 고정폭 글씨.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCategoryAddModal.styles";
import { MONO, hairline, ink } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { field, fieldLabel, footRule, ghostIcon, headRule, titleType } from "../../baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialCategoryAddModal.styles";

export const Header = styled(C.Header)`
    padding: 14px 12px 12px 20px;
    border-bottom: none;
    ${headRule}

    .title-input {
        ${titleType("1rem")}
        margin-right: 8px;
        caret-color: ${(p) => p.theme.colors.primary};
        &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; opacity: 0.7; }
    }

    .close-btn {
        ${ghostIcon("28px")}
        ${MOBILE} { width: 44px; height: 44px; }
    }

    ${MOBILE} { padding: 10px 6px 10px 16px; }
`;

export const ScrollBody = styled(C.ScrollBody)`
    gap: 2px;
    padding: 12px 20px 16px;
    ${MOBILE} { padding: 10px 16px 14px; }
`;

/** 색 — 고리를 두른 동그라미 하나 */
export const FieldRow = styled(C.FieldRow)`
    min-height: 40px;
    padding: 4px 0;
    border-bottom: none;

    label { ${fieldLabel} }

    .color-picker-wrapper {
        gap: 10px;

        .hex-text {
            font-family: ${MONO};
            font-size: 0.72rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            color: ${(p) => p.theme.colors.textSecondary};
        }

        input[type="color"] {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${(p) => hairline(p.theme, true)};
            transition: box-shadow 0.15s ease;

            &::-webkit-color-swatch { border: none; border-radius: 50%; box-shadow: none; }
            &::-moz-color-swatch { border: none; border-radius: 50%; }
            &:hover { box-shadow: 0 0 0 1px ${(p) => ink(p.theme, 0.3)}; }
            &:focus-visible { outline: 2px solid ${(p) => p.theme.colors.primary}; outline-offset: 3px; }
        }
    }
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 6px;
    padding: 8px 0 0;

    label { ${fieldLabel} }

    textarea {
        ${field}
        min-height: 84px;
        padding: 9px 10px;
    }
`;

export const Footer = styled(C.Footer)`
    ${footRule}
    padding: 12px 16px;
    background-color: ${(p) => p.theme.colors.surface};
`;
