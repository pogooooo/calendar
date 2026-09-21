/**
 * Maple 의 오른쪽 단추 메뉴 — 종이 쪽지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/TodoContextMenu.styles";
import { withAlpha } from "@/styles/color";
import { hair, paperCard } from "@/styles/maple/ink";

export * from "../celestial/TodoContextMenu.styles";

export const FloatingContextMenu = styled(C.FloatingContextMenu)`
    ${paperCard("3px")}
    border-radius: 2px;
    border-color: ${(p) => hair(p.theme, 0.5)};

    button, [role="menuitem"] {
        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }
    }
`;
