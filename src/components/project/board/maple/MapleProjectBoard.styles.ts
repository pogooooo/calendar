/**
 * Maple 의 프로젝트 보드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectBoard.styles";
import { hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialProjectBoard.styles";
export { SectionWrapper, SectionTitle } from "@/components/project/maple/section";

export const BoardColumn = styled(C.BoardColumn)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const ColumnHeader = styled(C.ColumnHeader)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const AddTaskButton = styled(C.AddTaskButton)`
    border-color: ${(p) => hair(p.theme, 0.4)};
`;

/** 작업 카드: 색인 카드처럼 종이 한 장 */
export const CardBox = styled(C.CardBox)`
    border-color: ${(p) => hair(p.theme, 0.35)};
    background-color: ${(p) => withAlpha(p.theme.colors.surface, 0.7)};
`;

export const CardMoveButton = styled(C.CardMoveButton)`
    border-color: ${(p) => hair(p.theme, 0.4)};
`;

/** 우선순위 표: 높음은 붉음, 보통은 먹, 낮음은 옅은 먹 */
export const PriorityTag = styled(C.PriorityTag)`
    color: ${(p) => p.$priority === "high" ? p.theme.colors.error : p.$priority === "low" ? p.theme.colors.textSecondary : p.theme.colors.text};
    border-color: ${(p) => p.$priority === "high" ? p.theme.colors.error : hair(p.theme, 0.4)};
`;
