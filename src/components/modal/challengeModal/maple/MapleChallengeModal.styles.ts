/**
 * Maple 의 챌린지 창 — 종이 서식 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialChallengeModal.styles";
import { withAlpha } from "@/styles/color";
import { formHeader, hair, inkInput } from "@/styles/maple/ink";

export * from "../celestial/CelestialChallengeModal.styles";

export const ModalHeader = styled(C.ModalHeader)`${formHeader}`;

export const FormArea = styled(C.FormArea)`
    border-color: ${(p) => hair(p.theme, 0.3)};

    input, textarea {
        ${inkInput}
        &:hover, &:focus { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.1)}; }
    }
`;
