/**
 * 바다의 프로젝트·작업 창 — 할 일 창과 같은 말: 금빛 실선 서식(Celestial)·먹선 종이(Maple) 대신
 * 16px·600 제목 밑과 단추 줄 위에만 머리카락 선, 28px 글자 단추 닫기, 상자 없는 "이름 + 칸" 줄,
 * 10px 모서리 입력칸, 36×20 스위치. 참가자·선행 조건은 판 안의 작은 카드에 놓인 8px 모서리 칩 —
 * 고르면 청록 기운이 돈다.
 * 데스크톱에서는 오른쪽 유리 시트(OceanBaseModal) — 서식이 시트 높이를 다 채우고 단추 줄은 시트 바닥에.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialModal.styles";
import { ink, seaChip, surface } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { field, fieldLabel, footRule, ghostIcon, headRule, sheetFill, sheetFootBg, switch36, titleType } from "../../baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialModal.styles";

export const FormWrapper = styled(C.FormWrapper)`
    background: transparent;
    ${sheetFill}
`;

export const Header = styled(C.Header)`
    padding: 14px 12px 12px 20px;
    background: transparent;
    ${headRule}
    ${MOBILE} { padding: 10px 6px 10px 16px; }
`;

export const TitleInput = styled(C.TitleInput)`
    ${titleType("1rem")}
    margin-right: 8px;
    border-bottom: none;
    caret-color: ${(p) => p.theme.colors.primary};
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; opacity: 0.7; }
    &:focus { border-bottom: none; }
`;

export const CloseButton = styled(C.CloseButton)`
    ${ghostIcon("28px")}
    ${MOBILE} { width: 44px; height: 44px; }
`;

export const ScrollBody = styled(C.ScrollBody)`
    gap: 2px;
    padding: 12px 20px 16px;
    background: transparent;
    ${MOBILE} { padding: 10px 16px 14px; }
`;

export const FieldRow = styled(C.FieldRow)`
    min-height: 40px;
    padding: 4px 0;
    border-bottom: none;
`;

export const FieldLabel = styled(C.FieldLabel)`
    ${fieldLabel}
    min-width: 96px;
`;

export const FieldInput = styled(C.FieldInput)`
    ${field}
    padding: 7px 10px;
    text-align: left;
    cursor: text;
    &:hover:not(:focus) { border-color: ${(p) => ink(p.theme, 0.2)}; }
    &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

export const ParticipantRow = styled(C.ParticipantRow)`
    gap: 8px;
    padding: 8px 0;
    border-bottom: none;
`;

/** 칩이 놓이는 작은 카드 */
export const ParticipantPicker = styled(C.ParticipantPicker)`
    ${surface("card")}
    gap: 6px;
    padding: 8px;
    border-radius: 12px;
`;

/** 칩 — 8px 모서리, 고르면 청록 기운 */
export const ParticipantItem = styled(C.ParticipantItem)`
    ${(p) => seaChip(p.$selected)}
    min-height: 28px;
    padding: 3px 10px;
    font-weight: ${(p) => (p.$selected ? 600 : 500)};

    &:hover:not(:disabled) {
        border-color: ${(p) => ink(p.theme, 0.22)};
        ${(p) => !p.$selected && css`background-color: ${ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)};`}
    }
    &:focus-visible { outline: 2px solid ${(p) => p.theme.colors.primary}; outline-offset: 2px; }
`;

export const ParticipantName = styled(C.ParticipantName)`
    font-size: 0.8125rem;
    color: inherit;
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 6px;
    padding: 8px 0 0;
`;

export const MemoTextArea = styled(C.MemoTextArea)`
    ${field}
    min-height: 92px;
    padding: 9px 10px;
    &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

/** 바닥 — 위에 머리카락 선, 단추는 오른쪽 (칩이 비어져 나오지 않게 뼈대의 z-index 는 그대로) */
export const Footer = styled(C.Footer)`
    ${footRule}
    padding: 12px 16px;
    background-color: ${(p) => p.theme.colors.surface};
    ${sheetFootBg}
`;

export const ErrorMessage = styled(C.ErrorMessage)`
    padding: 8px 20px;
    font-size: 0.78rem;
`;

export const ToggleSwitch = styled(C.ToggleSwitch)`${switch36}`;
