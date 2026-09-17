/**
 * Maple 의 설정 판 짜임 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 성좌(목차)의 별은 잎으로, 판 머리의 궤도 그림은 뗀다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSettings.layout";
import { hair, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialSettings.layout";

export const Orbit = styled(C.Orbit)`
    display: none;
`;

/** 목차의 별 → 잎 */
export const Mark = styled(C.Mark)`
    ${(p) => leafBullet(p.$on, "12px")}
    clip-path: none;
    color: ${(p) => p.theme.colors.primary};
    opacity: ${(p) => (p.$on ? 1 : 0.4)};
    animation: none;
    transform: translate(-50%, -50%) scale(${(p) => (p.$on ? 1.15 : 0.8)});
`;

export const Star = styled(C.Star)`
    clip-path: none;
    ${(p) => leafBullet(true, p.$small ? "7px" : "9px")}
    color: ${(p) => p.theme.colors.primary};
`;

export const ThemeCard = styled(C.ThemeCard)`
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 1px ${p.theme.colors.primary};
        &::after { display: none; }
    `}
`;

export const FontCard = styled(C.FontCard)`
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};
`;

export const WidgetCard = styled(C.WidgetCard)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const Note = styled(C.Note)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const NoteHead = styled(C.NoteHead)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;
