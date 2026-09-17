/**
 * Maple 의 프로젝트 머리글 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectHeader.styles";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialProjectHeader.styles";

export const HeaderLine = styled(C.HeaderLine)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

export const HeaderActionButton = styled(C.HeaderActionButton)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

export const Tab = styled(C.Tab)`
    border-color: ${(p) => (p.$active ? p.theme.colors.primary : hair(p.theme, 0.35))};
`;
