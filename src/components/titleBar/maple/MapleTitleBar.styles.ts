/**
 * Maple 의 제목 줄 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 밑줄 대신 먹 하이라인(theme.line), 이름은 고운바탕, 누르는 자리는 황토 물.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTitleBar.styles";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialTitleBar.styles";

export const Bar = styled(C.Bar)`
    border-bottom-color: ${(p) => hair(p.theme, 0.28)};
`;

export const Title = styled(C.Title)`
    color: ${(p) => p.theme.colors.text};
    letter-spacing: 0.2em;
    opacity: 0.85;
`;

export const Btn = styled(C.Btn)`
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.25)}; }
`;
