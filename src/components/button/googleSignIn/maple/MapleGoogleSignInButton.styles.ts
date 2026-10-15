/**
 * Maple 의 구글 로그인 단추 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 구글의 흰 단추는 구글이 정한 모양이라 색은 그대로 두고, 이웃한 단추(이메일로 로그인)와 같은 알약 모양으로만 맞춘다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialGoogleSignInButton.styles";

export * from "../celestial/CelestialGoogleSignInButton.styles";

export const Btn = styled(C.Btn)`
    border-radius: 999px;
    box-shadow: none;

    &:hover:not(:disabled) { box-shadow: none; }
`;

export const Label = styled(C.Label)`
    font-weight: 600;
    letter-spacing: 0;
`;
