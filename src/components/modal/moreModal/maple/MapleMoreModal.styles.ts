/**
 * Maple 의 "더보기" 창 — 종이 쪽지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialMoreModal.styles";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialMoreModal.styles";

export const Header = styled(C.Header)`
    border-bottom-color: ${(p) => hair(p.theme, 0.45)};
    font-family: ${(p) => p.theme.fonts.display};
`;

export const CountLabel = styled(C.CountLabel)`
    font-family: ${(p) => p.theme.fonts.numeral};
`;

export const SectionLabel = styled(C.SectionLabel)`
    border-color: ${(p) => hair(p.theme, 0.3)};
    letter-spacing: 0.08em;
`;

export const ChallengeItem = styled(C.ChallengeItem)`
    border-color: ${(p) => hair(p.theme, 0.25)};
    border-radius: 2px;
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; }
`;

export const TodoItem = styled(C.TodoItem)`
    border-color: ${(p) => hair(p.theme, 0.25)};
    border-radius: 2px;
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; }
`;
