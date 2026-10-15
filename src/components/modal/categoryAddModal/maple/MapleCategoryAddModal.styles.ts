/**
 * Maple 의 카테고리 창 — 깨끗한 서식 카드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 할 일 창과 같은 말: 고운바탕 굵은 제목, 14px 이름 + 오른쪽 칸, 옅은 선 하나, 칸은 inkInput.
 * 색 고르기는 둥근 견본(옅은 테)과 그 옆의 색 값.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCategoryAddModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { formFooter, formHeader, hair } from "@/styles/maple/ink";
import { field, fieldLabel, roundIcon, titleType } from "../../baseModal/maple/mapleLayer";

export * from "../celestial/CelestialCategoryAddModal.styles";

export const Header = styled(C.Header)`
    ${formHeader}
    gap: 8px;
    padding: 18px 14px 14px 24px;
    border-bottom-color: ${(p) => hair(p.theme, 0.08)};

    .title-input {
        ${titleType("1.25rem")}
        min-width: 0;
        margin-right: 0;
        padding: 2px 0 4px;
        border-bottom: 2px solid transparent;

        &::placeholder { color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.7)}; }
        &:focus { border-bottom-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; }
        &:focus-visible { outline: none; }
    }

    .close-btn { ${roundIcon("36px")} }

    ${MOBILE} {
        padding: 16px 10px 12px 20px;
        .close-btn { width: 40px; height: 40px; }
    }
`;

export const ScrollBody = styled(C.ScrollBody)`
    padding: 8px 24px 16px;
    gap: 0;

    ${MOBILE} { padding: 6px 20px 12px; }
`;

export const FieldRow = styled(C.FieldRow)`
    min-height: 56px;
    padding: 10px 0;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};

    label { ${fieldLabel} gap: 8px; }

    .color-picker-wrapper {
        gap: 10px;

        .hex-text {
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 0.8125rem;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
            color: ${(p) => p.theme.colors.textSecondary};
        }

        input[type="color"] {
            width: 30px;
            height: 30px;
            border-radius: 50%;

            &::-webkit-color-swatch {
                border-radius: 50%;
                box-shadow: inset 0 0 0 1px ${(p) => withAlpha(p.theme.colors.text, 0.14)};
            }
            &::-moz-color-swatch {
                border: none;
                border-radius: 50%;
                box-shadow: inset 0 0 0 1px ${(p) => withAlpha(p.theme.colors.text, 0.14)};
            }
            &:focus-visible { outline-offset: 2px; }
        }
    }
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 10px;
    padding: 14px 0 4px;

    label { ${fieldLabel} gap: 8px; }

    textarea {
        ${field}
        min-height: 88px;
        padding: 10px 12px;
        line-height: 1.55;
        ${MOBILE} { font-size: max(16px, 1rem); }
    }
`;

export const Footer = styled(C.Footer)`
    ${formFooter}
    gap: 8px;
    padding: 14px 20px 16px;
    border-top-color: ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} {
        padding: 12px 16px;
        & > button { flex: 1; min-height: 48px; }
    }
`;
