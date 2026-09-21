/**
 * Maple 의 알림 창 — 도감의 도판(plate) 한 장 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 타로 카드의 금빛 테두리와 귀퉁이 마름모 대신, 먹 하이라인 종이와 네 귀퉁이의 덩굴 장식(C3).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDialog.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkMask, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialDialog.styles";

export const Veil = styled(C.Veil)`
    background-color: ${(p) => withAlpha(p.theme.mode === "dark" ? "#000000" : "#3B2A20", p.theme.mode === "dark" ? 0.6 : 0.35)};
    backdrop-filter: blur(3px);
`;

const paper = css`
    background-color: ${(p) => p.theme.colors.surface};
    border-color: ${(p) => hair(p.theme, 0.55)};
    border-radius: 2px;
    box-shadow: 0 22px 50px -20px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.7 : 0.45)};

    &::before { border-color: ${(p) => hair(p.theme, 0.14)}; inset: 5px; }
`;

/** 귀퉁이 마름모 → 덩굴 장식. 하나를 네 방향으로 돌려 쓴다 */
export const Pip = styled(C.Pip)`
    width: 26px;
    height: 26px;
    border: none;
    background-color: ${(p) => p.theme.colors.text};
    ${inkMask("corner.webp")}
    opacity: 0.7;

    &:nth-of-type(1) { top: 3px; left: 3px; transform: none; }
    &:nth-of-type(2) { top: 3px; right: 3px; transform: scaleX(-1); }
    &:nth-of-type(3) { bottom: 3px; left: 3px; transform: scaleY(-1); }
    &:nth-of-type(4) { bottom: 3px; right: 3px; transform: scale(-1); }
`;

export const Numeral = styled(C.Numeral)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.9rem;
    letter-spacing: 0.16em;
`;

export const ArcanaName = styled(C.ArcanaName)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.7rem;
    letter-spacing: 0.2em;
`;

export const ActionButton = styled(C.ActionButton)`
    ${(p) => stampButton(p.$tone === "go" ? "primary" : p.$tone === "danger" ? "danger" : "default")}
    padding: 8px 16px;

    &:focus-visible { outline: 2px solid ${(p) => p.theme.colors.primary}; outline-offset: 2px; }
`;

export const FullCard = styled(C.FullCard)`
    ${paper}
    .rule { background-color: ${(p) => hair(p.theme, 0.3)}; }
`;

export const PlainCard = styled(C.PlainCard)`${paper}`;

export const BandCard = styled(C.BandCard)`
    ${paper}
    .banner { color: ${(p) => p.theme.colors.background}; }
`;

export const LandCard = styled(C.LandCard)`
    ${paper}
    .side { border-right-color: ${(p) => hair(p.theme, 0.3)}; }
`;
