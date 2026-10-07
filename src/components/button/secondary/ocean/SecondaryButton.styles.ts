/**
 * 바다의 둘째 단추 — 납작한 면에 10px 모서리. 뼈대(크기·정렬)는 Celestial 것을 쓰고 겉은 바꾼다:
 * 금빛 테두리·빛무리(Celestial), 고무도장(Maple) 대신 흰 면에 머리카락 선 하나(primary 는 청록을 꽉 채움), 누르면 살짝 눌린다.
 */
import styled from "styled-components";
import * as C from "../celestial/SecondaryButton.styles";
import { seaButton } from "@/styles/ocean/water";

export * from "../celestial/SecondaryButton.styles";

export const SecondaryButton = styled(C.SecondaryButton)`
    ${(p) => seaButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    font-size: 0.9rem;
`;
