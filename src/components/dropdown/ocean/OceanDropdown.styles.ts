/**
 * 바다의 드롭다운 — 지금 화면은 Select(바다의 고르기)에 폭(Sized)만 준다. 옛 조각들(머리·목록·줄·색 점)은
 * 이름만 남아 있어 쓰이지 않지만, 남는 동안에도 같은 결로: 10px 칸, 떠 있는 흰 판, 32px 줄, 8px 색 점.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDropdown.styles";
import { ink, surface, tideInput } from "@/styles/ocean/water";
import { menuRow } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialDropdown.styles";

export const DropdownContainer = styled(C.DropdownContainer)`
    font-family: ${(p) => p.theme.fonts.body};
`;

export const DropdownHeader = styled(C.DropdownHeader)`
    ${tideInput}
    padding: 7px 10px;
    font-size: 0.8125rem;
    &:hover { border-color: ${(p) => ink(p.theme, 0.2)}; background-color: transparent; }
    .placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const DropdownList = styled(C.DropdownList)`
    ${surface("float")}
    position: absolute;
    padding: 4px;
    border-radius: 12px;
`;

export const DropdownItem = styled(C.DropdownItem)`
    ${menuRow}
    gap: 8px;
    border-left: none;
    font-weight: ${(p) => (p.$selected ? 600 : 400)};
    background-color: ${(p) => (p.$selected ? ink(p.theme, 0.06) : "transparent")};
`;

export const ColorDot = styled(C.ColorDot)`
    width: 8px;
    height: 8px;
`;
