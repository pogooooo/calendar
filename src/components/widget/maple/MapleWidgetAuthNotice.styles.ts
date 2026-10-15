/**
 * Maple 의 위젯 안내 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetAuthNotice.styles";

export * from "../celestial/CelestialWidgetAuthNotice.styles";

export const Center = styled(C.Center)`
    font-family: ${(p) => p.theme.fonts.body};
    letter-spacing: 0;
`;
