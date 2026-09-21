/**
 * Maple 의 카테고리 창 — 종이 서식 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCategoryAddModal.styles";
import { withAlpha } from "@/styles/color";
import { formFooter, formHeader, formRow, inkInput } from "@/styles/maple/ink";

export * from "../celestial/CelestialCategoryAddModal.styles";

export const Header = styled(C.Header)`${formHeader}`;
export const FieldRow = styled(C.FieldRow)`${formRow}`;
export const MemoRow = styled(C.MemoRow)`
    ${formRow}
    textarea {
        ${inkInput}
        &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.1)}; }
    }
`;
export const Footer = styled(C.Footer)`${formFooter}`;
