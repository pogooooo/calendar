/**
 * Maple 의 카테고리 걸러 보기 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 여는 단추는 바탕 없는 둥근 네모(아이콘 단추), 펼친 창은 카드 한 장. 고른 카테고리는 제 색의 단풍잎, 안 고른 것은 옅은 잎.
 */
import styled from "styled-components";
import * as C from "../celestial/CategoryFilter.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafChip, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CategoryFilter.styles";

export const SetCategoryButton = styled(C.SetCategoryButton)`
    ${stampButton("ghost", { square: true })}
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    padding: 0;
    font-weight: 500;
    color: ${(p) => p.theme.colors.textSecondary};

    svg { width: 20px; height: 20px; }

    &:hover { color: ${(p) => p.theme.colors.text}; }
    &:hover svg { filter: none; }

    &[aria-expanded="true"] {
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.16 : 0.1)};
    }
`;

export const SettingsPopover = styled(C.SettingsPopover)`
    ${paperCard()}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 창은 떠 있어야 한다 */
    position: absolute;
    width: 232px;
    padding: 6px;
    box-shadow: ${(p) => (p.theme.mode === "dark"
        ? "0 2px 6px rgba(0, 0, 0, 0.35), 0 18px 40px -16px rgba(0, 0, 0, 0.7)"
        : "0 2px 6px rgba(86, 54, 32, 0.06), 0 18px 40px -16px rgba(86, 54, 32, 0.3)")};

    /* 모서리의 사선 장식은 없다 */
    &::after { content: none; }
`;

export const PopoverLabel = styled(C.PopoverLabel)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0;
    padding: 8px 8px 4px;
`;

/** 한 줄 — 둥근 칸, 안 고른 것은 옅게 (줄 긋기·밑줄 몸짓 없음) */
export const MenuItem = styled(C.MenuItem)`
    min-height: 40px;
    padding: 8px;
    border-radius: 8px;
    background-image: none;
    text-decoration: none;
    font-size: 0.875rem;
    opacity: ${(p) => (p.$isSelected ? 1 : 0.55)};
    transition: background-color 0.15s ease, opacity 0.15s ease;

    &:hover { background-color: ${(p) => hair(p.theme, 0.05)}; }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
    }
`;

/** 카테고리 색 → 단풍잎 하나 (고르면 제 색, 안 고르면 옅은 글자색) */
export const CategoryColorDot = styled(C.CategoryColorDot)`
    ${leafChip(5, "13px")}
    margin-right: 10px;
    background-color: ${(p) => (p.$isSelected ? p.$color : hair(p.theme, 0.3))};
    transition: background-color 0.2s ease;
`;

export const Divider = styled(C.Divider)`
    border-top: 1px solid ${(p) => hair(p.theme, 0.08)};
    margin: 6px 8px;
`;
