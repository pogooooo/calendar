/**
 * Maple 의 가입 화면 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·빛무리 대신 먹 하이라인, 제목은 고운바탕, 표제 밑의 짧은 먹선.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSignUp.styles";
import { withAlpha } from "@/styles/color";
import { hair, shortRule } from "@/styles/maple/ink";

export * from "../celestial/CelestialSignUp.styles";

/** 서식 쪽 종이: 금빛 세로선 대신 먹 하이라인 */
export const FormPanel = styled(C.FormPanel)`
    border-left-color: ${(p) => hair(p.theme, 0.3)};

    ${"@media (max-width: 900px)"} {
        border-left: none;
        border-top: 1px solid ${(p) => hair(p.theme, 0.3)};
    }
`;

/** 표제: 고운바탕, 밑에 씨앗 셋 달린 짧은 먹선 */
export const FormTitle = styled(C.FormTitle)`
    letter-spacing: 0.12em;

    &::after {
        content: "";
        display: block;
        width: 70px;
        height: 12px;
        margin: 10px auto 0;
        ${shortRule("12px")}
        background-color: ${(p) => p.theme.colors.text};
        opacity: 0.65;
    }
`;

export const FormSubtitle = styled(C.FormSubtitle)`
    letter-spacing: 0.04em;
    color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.95)};
`;
