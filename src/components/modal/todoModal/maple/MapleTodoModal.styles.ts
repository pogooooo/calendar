/**
 * Maple 의 할 일 창 — 종이 서식 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTodoModal.styles";
import { withAlpha } from "@/styles/color";
import { formFooter, formHeader, formRow, hair, inkInput, paperCard, paperToggle } from "@/styles/maple/ink";

export * from "../celestial/CelestialTodoModal.styles";

export const Header = styled(C.Header)`${formHeader}`;
export const FieldRow = styled(C.FieldRow)`${formRow}`;
export const RepeatRow = styled(C.RepeatRow)`${formRow}`;

export const RepeatConditionBox = styled(C.RepeatConditionBox)`
    ${paperCard("3px")}
    border-radius: 2px;

    input, select {
        ${inkInput}
        &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; }
    }
`;

export const MemoRow = styled(C.MemoRow)`
    textarea {
        ${inkInput}
        &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.1)}; }
    }
`;

export const DropdownHeader = styled(C.DropdownHeader)`
    ${inkInput}
    &:hover { border-color: ${(p) => hair(p.theme, 0.8)}; background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.12)}; }
`;

export const DropdownList = styled(C.DropdownList)`
    ${paperCard("3px")}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 창은 떠 있어야 한다 */
    position: absolute;
    border-radius: 2px;
`;

export const DropdownItem = styled(C.DropdownItem)`
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }
`;

export const ToggleSwitch = styled(C.ToggleSwitch)`${paperToggle}`;
export const Footer = styled(C.Footer)`${formFooter}`;
