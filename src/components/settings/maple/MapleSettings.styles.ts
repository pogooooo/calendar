/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSettings.styles";
import { hair } from "@/styles/maple/ink";
export * from "../celestial/CelestialSettings.styles";

/* 금빛 테두리 → 먹 하이라인. 굵기·모양은 Celestial 그대로, 색만 바꾼다 */
export const PageHeader = styled(C.PageHeader)`
    border-color: ${(p) => hair(p.theme)};
`;

export const SectionTitle = styled(C.SectionTitle)`
    border-color: ${(p) => hair(p.theme)};
`;

export const SectionBody = styled(C.SectionBody)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ThemeGrid = styled(C.ThemeGrid)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ThemeCard = styled(C.ThemeCard)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ThemePreview = styled(C.ThemePreview)`
    border-color: ${(p) => hair(p.theme)};
`;

export const CheckMark = styled(C.CheckMark)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ThemeSubSection = styled(C.ThemeSubSection)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ModeButtonGroup = styled(C.ModeButtonGroup)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ModeButton = styled(C.ModeButton)`
    border-color: ${(p) => hair(p.theme)};
`;

export const InfoRow = styled(C.InfoRow)`
    border-color: ${(p) => hair(p.theme)};
`;

export const FormInput = styled(C.FormInput)`
    border-color: ${(p) => hair(p.theme)};
`;

export const NavPanel = styled(C.NavPanel)`
    border-color: ${(p) => hair(p.theme)};
`;

export const NavTitle = styled(C.NavTitle)`
    border-color: ${(p) => hair(p.theme)};
`;
