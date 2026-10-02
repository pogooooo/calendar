/**
 * Maple 의 프로젝트 화면 틀 — 타임라인을 먼저 놓는 JSX 에 공용 조작 스타일을 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectPage.styles";
import { hair, shortRule } from "@/styles/maple/ink";

export * from "../celestial/CelestialProjectPage.styles";

/** 판 사이의 손잡이: 금빛 알약 → 씨앗 셋 달린 짧은 먹선 */
export const Resizer = styled(C.Resizer)`
    &::after {
        width: 74px;
        height: 12px;
        border-radius: 0;
        ${shortRule("12px")}
        background-color: ${(p) => hair(p.theme, 0.55)};
    }

    &:hover::after, &:active::after { background-color: ${(p) => p.theme.colors.primary}; }
`;

export const Empty = styled(C.Empty)`
    font-family: ${(p) => p.theme.fonts.display};
`;
