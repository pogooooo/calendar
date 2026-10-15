/**
 * Maple 의 프로젝트·작업 창 — 깨끗한 서식 카드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 할 일 창과 같은 말: 고운바탕 굵은 제목, 14px 이름 + 오른쪽 칸, 줄 사이는 옅은 선 하나, 칸은 inkInput.
 * 담당자·선행 조건은 알약 칩(고르면 옅은 붉음) — 칩이 많으면 옅은 테의 칸 안에서 굴러간다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { formFooter, hair, inkChip } from "@/styles/maple/ink";
import { field, fieldLabel, roundIcon, switchToggle, titleType } from "../../baseModal/maple/mapleLayer";

export * from "../celestial/CelestialModal.styles";

export const Header = styled(C.Header)`
    gap: 8px;
    padding: 18px 14px 14px 24px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} { padding: 16px 10px 12px 20px; }
`;

export const TitleInput = styled(C.TitleInput)`
    ${titleType("1.25rem")}
    min-width: 0;
    margin-right: 0;
    padding: 2px 0 4px;
    border-bottom: 2px solid transparent;

    &::placeholder { color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.7)}; }
    &:focus { border-bottom: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; box-shadow: none; }
    &:focus-visible { outline: none; }
`;

export const CloseButton = styled(C.CloseButton)`
    ${roundIcon("36px")}
    ${MOBILE} { width: 40px; height: 40px; }
`;

export const ScrollBody = styled(C.ScrollBody)`
    padding: 8px 24px 12px;
    gap: 0;

    ${MOBILE} { padding: 6px 20px 10px; }
`;

export const FieldRow = styled(C.FieldRow)`
    gap: 12px;
    min-height: 56px;
    padding: 10px 0;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};
`;

export const FieldLabel = styled(C.FieldLabel)`
    ${fieldLabel}
    gap: 8px;
    min-width: 92px;
`;

/** 검색칸(선행 조건) — 다른 칸과 같은 둥근 칸. 세로로 쌓는 줄(ParticipantRow) 안에 있어 뼈대의 flex: 1 이면 높이가 0 으로 눌린다 */
export const FieldInput = styled(C.FieldInput)`
    ${field}
    flex: none;
    width: 100%;
    height: 38px;
    padding: 0 12px;
    cursor: text;

    &:hover:not(:focus) { border-color: ${(p) => hair(p.theme, 0.26)}; }
    ${MOBILE} { font-size: max(16px, 1rem); }
`;

export const ParticipantRow = styled(C.ParticipantRow)`
    gap: 10px;
    padding: 12px 0 14px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};
`;

/** 칩이 놓이는 칸 — 옅은 테의 둥근 칸, 넘치면 안에서 굴러간다. 빈 말("맞는 것이 없어요")은 옅은 글씨 */
export const ParticipantPicker = styled(C.ParticipantPicker)`
    gap: 6px;
    min-height: 48px;
    max-height: 112px;
    padding: 8px;
    border: 1px solid ${(p) => hair(p.theme, 0.1)};
    border-radius: 12px;
    background-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.03 : 0.02)};
    color: ${(p) => p.theme.colors.textSecondary};

    & > span { align-self: center; padding: 0 4px; font-size: 0.8125rem; }
`;

/** 사람·할 일 칩 — 알약. 고르면 옅은 붉음에 붉은 글씨 */
export const ParticipantItem = styled(C.ParticipantItem)`
    ${(p) => inkChip(p.$selected)}
    min-height: 30px;
    padding: 0 12px;
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.16 : 0.08) : p.theme.colors.surface)};
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    &:hover:not(:disabled) {
        border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.55) : hair(p.theme, 0.26))};
        background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.2 : 0.12) : p.theme.colors.surface)};
    }
    /* 고를 수 없는 칩(순환이 되는 선행 조건)은 올려도 그대로 — 뼈대의 붉은 올림을 막는다 */
    &:disabled:hover {
        border-color: ${(p) => hair(p.theme, 0.14)};
        background-color: ${(p) => p.theme.colors.surface};
    }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.24)}; }

    ${MOBILE} { min-height: 40px; padding: 0 14px; }
`;

/** 칩 안의 이름 — 칩의 글자색을 따른다 */
export const ParticipantName = styled(C.ParticipantName)`
    font-size: 0.8125rem;
    font-weight: 500;
    color: inherit;
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 10px;
    padding: 14px 0 4px;
`;

export const MemoTextArea = styled(C.MemoTextArea)`
    ${field}
    min-height: 96px;
    padding: 10px 12px;
    line-height: 1.55;
    ${MOBILE} { font-size: max(16px, 1rem); }
`;

export const ErrorMessage = styled(C.ErrorMessage)`
    padding: 10px 24px 0;
    font-size: 0.8125rem;
    font-weight: 500;
`;

/** 바닥 — 옅은 윗줄, 삭제는 왼쪽 끝·취소와 저장은 오른쪽. 폰에서는 단추들이 폭을 나눠 가진 손가락 크기 */
export const Footer = styled(C.Footer)`
    ${formFooter}
    gap: 8px;
    padding: 14px 20px 16px;
    border-top-color: ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} {
        padding: 12px 16px;
        & > button { flex: 1; min-height: 46px; }
    }
`;

/** 폰에서는 단추가 폭을 나눠 가지므로 사이 띄움을 걷는다 */
export const FooterSpacer = styled(C.FooterSpacer)`
    ${MOBILE} { display: none; }
`;

/** 스위치 — 할 일 창과 같은 40×24 */
export const ToggleSwitch = styled(C.ToggleSwitch)`${switchToggle}`;
