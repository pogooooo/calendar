/**
 * Maple 의 고르기 — 먹선 칸에 잎 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSelect.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, leafBullet, paperCard } from "@/styles/maple/ink";

export * from "../celestial/CelestialSelect.styles";

export const Trigger = styled(C.Trigger)`
    ${inkInput}

    &:hover:not(:disabled) { border-color: ${(p) => hair(p.theme, 0.8)}; }
    &:focus-visible { outline: none; border-color: ${(p) => p.theme.colors.primary}; }
`;

/** 화살표 → 작은 잎. 열면 뒤집힌다 */
export const Chev = styled(C.Chev)`
    ${leafBullet(true, "9px")}
    background-color: ${(p) => p.theme.colors.primary};
    font-size: 0;
`;

export const Menu = styled(C.Menu)`
    ${paperCard("3px")}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 창은 떠 있어야 한다 */
    position: fixed;
    border-color: ${(p) => hair(p.theme, 0.5)};
    box-shadow: 0 10px 24px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.5 : 0.16)};
    padding: 5px 0;
`;

export const Item = styled(C.Item)`
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.2)}; }
    &:focus-visible { outline: none; background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.2)}; }
`;

/** 항목 앞의 마름모 → 잎 (고른 것은 붉은 잎) */
export const Diamond = styled(C.Diamond)`
    ${(p) => leafBullet(p.$on, "10px")}
    background-color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
`;

export const Tick = styled(C.Tick)`
    ${leafBullet(true, "9px")}
    background-color: ${(p) => p.theme.colors.primary};
    font-size: 0;
`;
