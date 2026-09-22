/**
 * Maple 의 저장 실패 띠 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSaveFailureNotice.styles";

export * from "../celestial/CelestialSaveFailureNotice.styles";

/** 종이 위의 붉은 띠 — 모서리를 없애고 그림자 대신 먹 테두리만 */
export const Bar = styled(C.Bar)`
    border-radius: 2px;
    box-shadow: none;
    font-family: ${(p) => p.theme.fonts.display};
`;
