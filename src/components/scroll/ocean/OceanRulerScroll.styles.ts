/**
 * 바다의 눈금자 스크롤 — 금빛 눈금·별 표식·청록 막대(Celestial), 먹 눈금·잎·책갈피(Maple) 대신
 * 옅은 머리카락 눈금, 내용이 있는 줄엔 카테고리 색 작은 점, 막대는 가는 무채색 손잡이(잡으면 청록),
 * 이름표는 떠 있는 작은 흰 꼬리표에 고정폭 시각.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialRulerScroll.styles";
import { MONO, ink, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialRulerScroll.styles";

export const Area = styled(C.Area)`
    &:focus-visible {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.45)};
        outline-offset: -2px;
        border-radius: 8px;
    }
`;

export const Tick = styled(C.Tick)`
    right: 9px;
    width: ${(p) => (p.$major ? 8 : 4)}px;
    opacity: 1;
    background-color: ${(p) => ink(p.theme, p.$major ? 0.26 : 0.14)};

    ${MOBILE} { right: 5px; width: ${(p) => (p.$major ? 5 : 3)}px; }
`;

export const TickLabel = styled(C.TickLabel)`
    right: 20px;
    font-family: ${MONO};
    font-size: 0.56rem;
    letter-spacing: 0;
`;

/** 별 표식 → 카테고리 색 작은 점 */
export const Mark = styled(C.Mark)`
    right: 2px;
    width: 4px;
    height: 4px;
    clip-path: none;
    border-radius: 50%;

    ${MOBILE} { right: 1px; }
`;

/** 막대 → 가는 무채색 손잡이. 올리면 짙어지고 잡으면 청록 */
export const Thumb = styled(C.Thumb)`
    right: 1px;
    width: 5px;
    min-height: 24px;
    border-radius: 3px;
    background-color: ${(p) => ink(p.theme, 0.2)};
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => ink(p.theme, 0.34)}; }
    &:active { background-color: ${(p) => p.theme.colors.primary}; }

    ${MOBILE} { width: 3px; }
`;

/** 이름표 — 떠 있는 작은 흰 꼬리표, 고정폭 시각 */
export const Flag = styled(C.Flag)`
    ${surface("float")}
    right: 12px;
    padding: 2px 6px;
    border-radius: 6px;
    font-family: ${MONO};
    font-size: 0.6rem;
    font-weight: 500;
    color: ${(p) => p.theme.colors.text};
`;
