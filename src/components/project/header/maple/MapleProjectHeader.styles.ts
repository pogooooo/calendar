/**
 * Maple 의 프로젝트 머리글 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectHeader.styles";
import { hair } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectHeader.styles";

export const HeaderLine = styled(C.HeaderLine)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

export const HeaderActionButton = styled(C.HeaderActionButton)`
    border-color: ${(p) => hair(p.theme, 0.45)};
    /* 채운 단추·좁은 자간은 Celestial 만 */
    letter-spacing: 1.5px;
    &:last-child { background: transparent; color: ${(p) => p.theme.colors.primary}; }
    ${MOBILE} { letter-spacing: 1px; }
`;

export const Tab = styled(C.Tab)`
    /* 밑줄 꼬리표는 Celestial 만 — Maple 은 상자 */
    border: 1px solid ${(p) => (p.$active ? p.theme.colors.primary : hair(p.theme, 0.35))};
    box-shadow: ${(p) => (p.$active ? `0 0 6px ${p.theme.colors.primary}55` : "none")};
    color: ${(p) => p.theme.colors.text};
    padding: 6px 16px;
    &::after { display: none; }
    &:hover { color: ${(p) => p.theme.colors.text}; }
`;

export const CategoryTag = styled(C.CategoryTag)`
    display: block;
    font-size: 0.7rem;
    padding: 2px 8px;
    letter-spacing: 1px;
    color: ${(p) => p.$color};
    border: 1px solid ${(p) => p.$color};
    &::before { display: none; }
`;
