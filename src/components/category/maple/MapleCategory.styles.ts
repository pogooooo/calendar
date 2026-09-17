/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { hair } from "@/styles/maple/ink";
export * from "../celestial/CelestialCategory.styles";

/* 금빛 테두리 → 먹 하이라인. 굵기·모양은 Celestial 그대로, 색만 바꾼다 */
export const PageHeader = styled(C.PageHeader)`
    border-color: ${(p) => hair(p.theme)};
`;

export const DeckAddCard = styled(C.DeckAddCard)`
    border-color: ${(p) => hair(p.theme)};
`;

export const Corners = styled(C.Corners)`
    border-color: ${(p) => hair(p.theme)};
`;

export const Plate = styled(C.Plate)`
    border-color: ${(p) => hair(p.theme)};
`;

export const LoreRow = styled(C.LoreRow)`
    border-color: ${(p) => hair(p.theme)};
`;

export const DescBlock = styled(C.DescBlock)`
    border-color: ${(p) => hair(p.theme)};
`;

export const TodoCard = styled(C.TodoCard)`
    border-color: ${(p) => hair(p.theme)};
`;

export const EmptyBox = styled(C.EmptyBox)`
    border-color: ${(p) => hair(p.theme)};
`;

export const ModalContent = styled(C.ModalContent)`
    border-color: ${(p) => hair(p.theme)};
`;
