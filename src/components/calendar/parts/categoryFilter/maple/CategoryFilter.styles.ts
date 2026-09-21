/**
 * Maple 의 카테고리 걸러 보기 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CategoryFilter.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafBullet, paperCard } from "@/styles/maple/ink";

export * from "../celestial/CategoryFilter.styles";

export const SetCategoryButton = styled(C.SetCategoryButton)`
    color: ${(p) => p.theme.colors.text};
    &:hover svg { filter: none; color: ${(p) => p.theme.colors.primary}; }
`;

export const SettingsPopover = styled(C.SettingsPopover)`
    ${paperCard("3px")}
    border-radius: 2px;
`;

export const MenuItem = styled(C.MenuItem)`
    background-image: none;
    text-decoration: none;

    &:hover { background-size: 0 0; background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)}; }
`;

/** 카테고리 색 마름모 → 잎 */
export const CategoryColorDot = styled(C.CategoryColorDot)`
    ${(p) => leafBullet(p.$isSelected, "11px")}
    background-color: ${(p) => (p.$isSelected ? p.$color : p.theme.colors.textSecondary)};
`;

export const Divider = styled(C.Divider)`
    border-top-color: ${(p) => hair(p.theme, 0.3)};
`;
