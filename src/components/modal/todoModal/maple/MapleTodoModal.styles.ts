/**
 * Maple 의 할 일 창 — 깨끗한 서식 카드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 제목은 고운바탕 굵게(20px), 줄은 14px 이름(옅은 글씨) + 오른쪽 칸, 줄 사이는 옅은 선 하나.
 * 칸은 모두 inkInput 의 둥근 칸(장소·반복·메모도 날짜·고르개와 같은 모양으로), 스위치는 40×24.
 * 왼쪽 가장자리를 하나로 맞춘다 — 제목·고르개·줄 이름이 모두 창 왼쪽에서 24px.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialTodoModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { formFooter, formHeader, hair } from "@/styles/maple/ink";
import { field, fieldLabel, roundIcon, switchToggle, titleType } from "../../baseModal/maple/mapleLayer";

export * from "../celestial/CelestialTodoModal.styles";

/** 칸의 바탕 — 뼈대가 올렸을 때·초점일 때 바탕을 바꾸므로 그때도 같은 바탕을 다시 깐다 */
const fieldBg = css`
    background-color: ${(p) => (p.theme.mode === "dark" ? withAlpha("#000000", 0.18) : withAlpha("#FFFFFF", 0.85))};
`;

/** 줄 이름 — 아이콘과 14px 옅은 글씨 */
const rowLabel = css`
    label {
        ${fieldLabel}
        gap: 8px;
        min-width: 92px;
    }
`;

export const Header = styled(C.Header)`
    ${formHeader}
    gap: 8px;
    padding: 18px 14px 14px 24px;
    border-bottom-color: ${(p) => hair(p.theme, 0.08)};

    .title-input {
        ${titleType("1.25rem")}
        margin-right: 0;
        padding: 2px 0 4px;
        border-bottom: 2px solid transparent;

        &::placeholder { color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.7)}; }
        &:focus { border-bottom-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; }
    }

    .close-btn { ${roundIcon("36px")} }

    ${MOBILE} {
        padding: 16px 10px 12px 20px;
        .close-btn { width: 40px; height: 40px; }
    }
`;

/** 몸통 — 줄의 안쪽 여백(8px)과 합쳐 줄 이름이 제목과 같은 24px 에 선다 */
export const ScrollBody = styled(C.ScrollBody)`
    padding: 14px 16px 12px;
    gap: 0;

    ${MOBILE} { padding: 12px 12px 10px; }
`;

export const FieldRow = styled(C.FieldRow)`
    ${rowLabel}
    min-height: 56px;
    gap: 12px;
    padding: 10px 8px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};

    /* 장소 — 날짜·고르개와 같은 둥근 칸 (예전엔 테 없는 오른쪽 맞춤 글자라 칸인 줄 몰랐다) */
    input[type="text"], input[type="date"], input[type="datetime-local"] {
        ${field}
        height: 38px;
        padding: 0 12px;
        text-align: left;
        cursor: text;

        &:hover, &:focus { ${fieldBg} }
        ${MOBILE} { font-size: max(16px, 1rem); }
    }

    ${MOBILE} {
        label { min-width: 84px; }
    }
`;

/** 반복 — 숫자 칸도 둥근 칸, 단위는 옅은 글씨 */
export const RepeatRow = styled(C.RepeatRow)`
    ${rowLabel}
    gap: 12px;
    padding: 10px 8px 12px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};

    .repeat-header {
        min-height: 36px;

        .repeat-input-group {
            gap: 8px;

            input[type="number"] {
                ${field}
                width: 64px;
                height: 36px;
                padding: 0 8px;
                text-align: center;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                color: ${(p) => p.theme.colors.text};

                &::placeholder { font-weight: 500; }
                &:hover, &:focus { ${fieldBg} }
                ${MOBILE} { font-size: max(16px, 1rem); }
            }

            span {
                font-size: 0.875rem;
                color: ${(p) => p.theme.colors.textSecondary};
            }
        }
    }
`;

/** 반복이 끝나는 조건 — 줄 아래에 옅게 깔린 안쪽 판 */
export const RepeatConditionBox = styled(C.RepeatConditionBox)`
    gap: 10px;
    padding: 14px;
    border: 1px solid ${(p) => hair(p.theme, 0.08)};
    border-radius: 12px;
    background-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.04 : 0.025)};

    .condition-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    input[type="date"], input[type="number"] {
        ${field}
        height: 38px;
        padding: 0 12px;

        &:hover, &:focus { ${fieldBg} }
        ${MOBILE} { font-size: max(16px, 1rem); }
    }

    .count-input-group span {
        font-size: 0.875rem;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 10px;
    padding: 16px 8px 4px;

    label {
        ${fieldLabel}
        gap: 8px;
    }

    textarea {
        ${field}
        min-height: 96px;
        padding: 10px 12px;
        line-height: 1.55;
        resize: vertical;

        &:focus { ${fieldBg} }
        ${MOBILE} { font-size: max(16px, 1rem); }
    }
`;

export const ToggleSwitch = styled(C.ToggleSwitch)`${switchToggle}`;

/** 바닥 — 옅은 윗줄, 단추는 오른쪽(폰은 넓게). 고칠 때의 "삭제"는 왼쪽 끝으로 떼어 저장과 멀리 둔다 */
export const Footer = styled(C.Footer)`
    ${formFooter}
    gap: 8px;
    padding: 14px 20px 16px;
    border-top-color: ${(p) => hair(p.theme, 0.08)};

    & > button:first-child:not(:last-child) { margin-right: auto; }

    ${MOBILE} { padding: 12px 16px; }
`;
