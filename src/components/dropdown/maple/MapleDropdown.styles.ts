/**
 * Maple 의 드롭다운 — 먹선 칸과 종이 쪽지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDropdown.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, paperCard } from "@/styles/maple/ink";

export * from "../celestial/CelestialDropdown.styles";

export const DropdownHeader = styled(C.DropdownHeader)`
    ${inkInput}
    border-radius: 2px;

    &:hover {
        border-color: ${(p) => (p.$disabled ? hair(p.theme, 0.45) : hair(p.theme, 0.8))};
        background-color: ${(p) => withAlpha(p.theme.colors.background, p.theme.mode === "dark" ? 0.4 : 0.6)};
    }
`;

export const DropdownList = styled(C.DropdownList)`
    ${paperCard("3px")}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 창은 떠 있어야 한다 */
    position: absolute;
    border-radius: 2px;
    border-color: ${(p) => hair(p.theme, 0.5)};
`;

export const DropdownItem = styled(C.DropdownItem)`
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.22) : "transparent")};
    border-left-color: ${(p) => (p.$selected ? p.theme.colors.primary : "transparent")};

    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }
`;
