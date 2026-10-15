/**
 * Maple 의 입력칸(로그인·가입) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 52px 둥근 칸(inkInput). 이름은 비었을 때 칸 가운데의 옅은 글씨였다가, 손이 가거나 글이 차면 칸 안 위쪽으로 올라가
 * 12px 이름이 되고 글은 그 아래에 선다 — 테를 끊고 걸터앉는 이름표(Celestial)나 칸 밖으로 나가는 이름(바다)과 다르다.
 * 예전엔 이름 뒤에 종이색 조각을 깔아 카드 위에서 네모난 얼룩이 보였다.
 */
import styled from "styled-components";
import * as C from "../celestial/SingleInput.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair, inkInput } from "@/styles/maple/ink";

export * from "../celestial/SingleInput.styles";

const EASE = "cubic-bezier(0.2, 0.8, 0.3, 1)";

export const CelestialLabel = styled(C.CelestialLabel)`
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    padding: 0;
    background-color: transparent;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: top 0.18s ${EASE}, transform 0.18s ${EASE}, font-size 0.18s ${EASE}, color 0.15s ease;
`;

export const CelestialInput = styled(C.CelestialInput)`
    ${inkInput}
    height: 52px;
    padding: 20px 14px 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1rem;
    line-height: 1.4;
    caret-color: ${(p) => p.theme.colors.primary};

    &:hover:not(:focus) { border-color: ${(p) => hair(p.theme, 0.26)}; }

    /* 올라간 이름 — 칸 안 위쪽의 12px */
    &:focus + .input-label, &:not(:placeholder-shown) + .input-label {
        top: 9px;
        transform: none;
        font-size: 0.75rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    &:focus + .input-label { color: ${(p) => p.theme.colors.primary}; }

    /* 브라우저가 채운 칸(저장된 이메일)은 노란 바탕 대신 카드 색 */
    &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 40px ${(p) => p.theme.colors.surface} inset;
        -webkit-text-fill-color: ${(p) => p.theme.colors.text};
    }
    &:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 40px ${(p) => p.theme.colors.surface} inset, 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.14)};
    }

    ${MOBILE} { font-size: max(16px, 1rem); }
`;
