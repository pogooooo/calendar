/**
 * 바다의 둘째 단추 — 바다 유리 알약. 뼈대(크기·정렬)는 Celestial 것을 쓰고 겉은 전부 바꾼다:
 * 금빛 테두리·빛무리(Celestial), 고무도장(Maple) 대신 둥근 유리, 올리면 물빛이 한 번 스치고 누르면 살짝 가라앉는다.
 */
import styled from "styled-components";
import * as C from "../celestial/SecondaryButton.styles";
import { seaButton } from "@/styles/ocean/water";

export * from "../celestial/SecondaryButton.styles";

export const SecondaryButton = styled(C.SecondaryButton)`
    ${(p) => seaButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    font-size: 0.95rem;
    font-weight: 600;
    &:hover { box-shadow: 0 8px 18px ${(p) => p.theme.colors.primary}33; border-color: ${(p) => p.theme.colors.primary}55; }
`;
