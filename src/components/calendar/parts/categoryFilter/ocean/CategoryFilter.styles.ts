/**
 * 바다의 카테고리 걸러 보기 — 금빛 빛무리 아이콘·귀퉁이 사선·마름모·취소선(Celestial), 잎(Maple) 대신:
 *   여는 단추는 32px 글자 단추(열려 있으면 옅게 칠해진 채), 펼친 창은 떠 있는 흰 판(12px 모서리)
 *   묶음 이름은 작은 옅은 글씨, 한 줄은 32px·8px 모서리 칠
 *   보이는 카테고리는 제 색으로 찬 점, 숨긴 것은 빈 고리(글자는 지우지 않고 옅게만), 묶음 사이엔 머리카락 선
 */
import styled from "styled-components";
import * as C from "../celestial/CategoryFilter.styles";
import { EASE, focusRing, hairline, ink, surface } from "@/styles/ocean/water";
import { menuRow } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CategoryFilter.styles";

/** 여는 단추 — 32px 글자 단추 */
export const SetCategoryButton = styled(C.SetCategoryButton)`
    width: 32px;
    height: 32px;
    min-width: 0;
    min-height: 0;
    padding: 0;
    border-radius: 8px;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease;

    svg { width: 18px; height: 18px; stroke-width: 1.75; }

    &:hover, &[aria-expanded="true"] {
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)};
    }
    &:hover svg { filter: none; }
    ${focusRing}
    @media (hover: none) { width: 40px; height: 40px; }
`;

/** 펼친 창 — 떠 있는 흰 판, 귀퉁이 사선은 뗀다. 몸은 framer-motion 이 움직인다 */
export const SettingsPopover = styled(C.SettingsPopover)`
    ${surface("float")}
    position: absolute;
    width: 224px;
    padding: 4px;
    border-radius: 12px;
    font-family: ${(p) => p.theme.fonts.body};

    &::after { display: none; }
`;

export const PopoverLabel = styled(C.PopoverLabel)`
    padding: 8px 8px 4px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0;
`;

/** 한 줄 — 취소선 대신 옅어지기만 */
export const MenuItem = styled(C.MenuItem)`
    ${menuRow}
    min-height: 32px;
    padding: 0 8px;
    text-decoration: none;
    background-image: none;
    opacity: 1;
    color: ${(p) => (p.$isSelected ? p.theme.colors.text : p.theme.colors.textSecondary)};

    &:hover { background-size: 0 0; }
    &:focus-visible { outline: none; background-color: ${(p) => ink(p.theme, 0.06)}; }
    @media (hover: none) { min-height: 44px; }
`;

/** 보이는 것은 제 색으로 찬 점, 숨긴 것은 빈 고리 */
export const CategoryColorDot = styled(C.CategoryColorDot)`
    width: 10px;
    height: 10px;
    margin-right: 10px;
    border-radius: 50%;
    transform: none;
    border: 1.5px solid ${(p) => (p.$isSelected ? p.$color : ink(p.theme, 0.3))};
    background-color: ${(p) => (p.$isSelected ? p.$color : "transparent")};
    transition: background-color 0.15s ${EASE}, border-color 0.15s ${EASE};
`;

export const Divider = styled(C.Divider)`
    margin: 4px 6px;
    border: none;
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;
