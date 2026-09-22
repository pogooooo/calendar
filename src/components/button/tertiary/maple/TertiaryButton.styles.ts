/**
 * Maple 의 셋째 단추 — 먹 글씨에 붉은 밑줄 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/TertiaryButton.styles";
import { brushUnderline } from "@/styles/maple/ink";

export * from "../celestial/TertiaryButton.styles";

export const TertiaryButton = styled(C.TertiaryButton)`
    position: relative;
    color: ${(p) => p.theme.colors.primary};
    font-family: ${(p) => p.theme.fonts.display};
    text-decoration: none;
    border-bottom: 1px solid transparent;

    /* 마우스를 올리면 붓으로 그은 밑줄(J3 b — 마른 붓) */
    &::after {
        ${brushUnderline("b", "5px")}
        bottom: -4px;
        background-color: ${(p) => p.theme.colors.primary};
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    &:hover {
        text-decoration: none;
        &::after { opacity: 1; }
    }
`;
