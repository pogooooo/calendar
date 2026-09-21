/**
 * Maple 의 프로젝트·작업 창 — 종이 서식 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialModal.styles";
import { withAlpha } from "@/styles/color";
import { formFooter, hair, inkInput, paperCard } from "@/styles/maple/ink";

export * from "../celestial/CelestialModal.styles";

export const Header = styled(C.Header)`
    border-bottom-color: ${(p) => hair(p.theme, 0.45)};
`;

export const TitleInput = styled(C.TitleInput)`
    font-family: ${(p) => p.theme.fonts.display};
    border-color: transparent;
    &:focus { border-bottom-color: ${(p) => p.theme.colors.primary}; box-shadow: none; }
`;

export const FieldRow = styled(C.FieldRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.18)};
`;

export const FieldInput = styled(C.FieldInput)`
    ${inkInput}
    &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.12)}; }
`;

export const ParticipantRow = styled(C.ParticipantRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.18)};
`;

export const ParticipantPicker = styled(C.ParticipantPicker)`
    ${paperCard("3px")}
    border-radius: 2px;
`;

export const ParticipantItem = styled(C.ParticipantItem)`
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.35))};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.22) : "transparent")};
    border-radius: 2px;
`;

export const MemoTextArea = styled(C.MemoTextArea)`
    ${inkInput}
    &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.1)}; }
`;

export const Footer = styled(C.Footer)`${formFooter}`;
