/**
 * 바다의 고르기 — 금빛 실선 칸과 마름모·✦(Celestial), 먹선 칸과 잎(Maple) 대신
 * 10px 모서리의 흰 칸(선 하나) + 가는 아래 화살(열면 뒤집힌다). 펼친 목록은 떠 있는 흰 판(12px 모서리),
 * 한 줄은 32px·8px 모서리 칠, 고른 줄 끝엔 청록 체크. 색 있는 항목(카테고리)은 8px 색 점, 색 없는 항목은 표식 없이 글만.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSelect.styles";
import { EASE, ink, surface, tideInput } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { checkMark, chevronMark, menuIn, menuRow } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialSelect.styles";

export const Trigger = styled(C.Trigger)`
    ${tideInput}
    gap: 8px;
    padding: ${(p) => (p.$size === "sm" ? "5px 8px" : "7px 10px")};
    font-family: ${(p) => p.theme.fonts.body};
    font-size: ${(p) => (p.$size === "sm" ? "0.78rem" : "0.8125rem")};

    &:hover:not(:disabled) { border-color: ${(p) => ink(p.theme, 0.2)}; }
    &:focus-visible { outline: none; border-color: ${(p) => p.theme.colors.primary}; }
    &[aria-expanded="true"] { border-color: ${(p) => p.theme.colors.primary}; }
`;

/** ▾ 글자 대신 가는 화살 */
export const Chev = styled(C.Chev)`
    ${chevronMark("14px")}
    font-size: 0;
    transition: transform 0.18s ${EASE};
`;

export const Menu = styled(C.Menu)`
    ${surface("float")}
    position: fixed;
    padding: 4px;
    border-radius: 12px;
    animation: ${menuIn} 0.16s ${EASE} both;
`;

export const Item = styled(C.Item)`
    ${menuRow}
    gap: 8px;
    font-weight: ${(p) => (p.$on ? 600 : 400)};
    &:focus-visible { outline: none; background-color: ${(p) => ink(p.theme, 0.06)}; }
    ${MOBILE} { min-height: 44px; }
`;

/** 색 없는 항목에는 표식을 두지 않는다 — 고른 것은 끝의 체크가 알린다 */
export const Diamond = styled(C.Diamond)`
    display: none;
`;

/** 카테고리 색 — 8px 점 */
export const Dot = styled(C.Dot)`
    width: 8px;
    height: 8px;
`;

/** ✦ 대신 청록 체크 */
export const Tick = styled(C.Tick)`
    ${checkMark("14px")}
    font-size: 0;
`;
