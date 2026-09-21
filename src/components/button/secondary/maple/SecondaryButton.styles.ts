/**
 * Maple 의 둘째 단추 — 도장 단추 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SecondaryButton.styles";
import { withAlpha } from "@/styles/color";
import { stampButton } from "@/styles/maple/ink";

export * from "../celestial/SecondaryButton.styles";

export const SecondaryButton = styled(C.SecondaryButton)`
    ${(p) => stampButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    font-size: ${(p) => p.theme.fontSizes.body};

    ${(p) => p.$variant === "primary" && css`
        &:hover { box-shadow: none; }
    `}

    &:active { transform: translateY(1px); }
`;
