/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CategoryFilter.styles";
import { hair } from "@/styles/maple/ink";
export * from "../celestial/CategoryFilter.styles";

/* 금빛 테두리 → 먹 하이라인. 굵기·모양은 Celestial 그대로, 색만 바꾼다 */
export const SettingsPopover = styled(C.SettingsPopover)`
    border-color: ${(p) => hair(p.theme)};
`;

export const Divider = styled(C.Divider)`
    border-color: ${(p) => hair(p.theme)};
`;
