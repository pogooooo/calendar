/**
 * 바다의 구글 로그인 단추 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 색·선·글꼴·로고는 구글이 정한 그대로(밝은 벌은 흰 단추, 어두운 벌은 구글의 어두운 단추).
 * 바다에서는 옆의 입력칸과 같은 폭·높이(44px)·모서리(10px)로 맞추고, 그림자는 두지 않는다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialGoogleSignInButton.styles";
import { focusRing } from "@/styles/ocean/water";

export * from "../celestial/CelestialGoogleSignInButton.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Btn = styled(C.Btn)`
    width: 100%;
    height: 44px;
    border-radius: 10px;
    background: ${(p) => (dark(p) ? "#131314" : "#FFFFFF")};
    border: 1px solid ${(p) => (dark(p) ? "#8E918F" : "#747775")};
    box-shadow: none;
    transition: background-color 0.15s ease, transform 0.1s ease;
    ${focusRing}

    &:hover:not(:disabled) {
        background: ${(p) => (dark(p) ? "#1F1F20" : "#F4F5F5")};
        box-shadow: none;
    }

    &:active:not(:disabled) {
        background: ${(p) => (dark(p) ? "#2A2B2C" : "#ECEDED")};
        transform: scale(0.985);
    }
`;

export const Label = styled(C.Label)`
    color: ${(p) => (dark(p) ? "#E3E3E3" : "#1F1F1F")};
`;
