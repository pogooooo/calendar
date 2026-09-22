/**
 * Maple 의 눈금자 스크롤 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 눈금·별 표식 대신 먹 눈금과 잎 표식, 막대는 연필 자국.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialRulerScroll.styles";
import { withAlpha } from "@/styles/color";
import { bookmark, hair, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialRulerScroll.styles";

export const Area = styled(C.Area)`
    &:focus-visible { outline-color: ${(p) => hair(p.theme, 0.6)}; }
`;

export const Tick = styled(C.Tick)`
    background-color: ${(p) => hair(p.theme, 0.5)};
`;

export const TickLabel = styled(C.TickLabel)`
    font-family: ${(p) => p.theme.fonts.numeral};
`;

/** 별 표식 → 잎 (카테고리 색) */
export const Mark = styled(C.Mark)`
    ${leafBullet(true, "9px")}
    clip-path: none;
    background-color: ${(p) => p.$color ?? p.theme.colors.primary};
`;

/** 막대 → 책갈피 리본(J5). 짧아도 제비꼬리가 보이게 최소 높이를 둔다 */
export const Thumb = styled(C.Thumb)`
    ${bookmark}
    width: 9px;
    right: 0;
    min-height: 34px;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.85)};
    &:hover, &:active { background-color: ${(p) => p.theme.colors.primary}; }
`;

export const Flag = styled(C.Flag)`
    background-color: ${(p) => p.theme.colors.primary};
`;
