/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWeekCalendar.styles";
import { hair } from "@/styles/maple/ink";
export * from "../celestial/CelestialWeekCalendar.styles";

/* 금빛 테두리 → 먹 하이라인. 굵기·모양은 Celestial 그대로, 색만 바꾼다 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    border-color: ${(p) => hair(p.theme)};
`;

export const Header = styled(C.Header)`
    border-color: ${(p) => hair(p.theme)};
`;

export const DayNameBox = styled(C.DayNameBox)`
    border-color: ${(p) => hair(p.theme)};
`;

export const BarContainer = styled(C.BarContainer)`
    border-color: ${(p) => hair(p.theme)};
`;

export const AddTodoButton = styled(C.AddTodoButton)`
    border-color: ${(p) => hair(p.theme)};
`;

export const DaySlot = styled(C.DaySlot)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ModalContainer = styled(C.ModalContainer)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ModalHeader = styled(C.ModalHeader)`
    border-color: ${(p) => hair(p.theme)};
`;
