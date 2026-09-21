/**
 * Maple 의 셋째 단추 — 먹 글씨에 붉은 밑줄 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/TertiaryButton.styles";

export * from "../celestial/TertiaryButton.styles";

export const TertiaryButton = styled(C.TertiaryButton)`
    color: ${(p) => p.theme.colors.primary};
    font-family: ${(p) => p.theme.fonts.display};
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s ease;

    &:hover {
        text-decoration: none;
        border-bottom-color: ${(p) => p.theme.colors.primary};
    }
`;
