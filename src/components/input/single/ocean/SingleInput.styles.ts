/**
 * 바다의 입력칸(로그인·가입) — 금빛 실선 칸에 걸쳐 앉는 이름표(Celestial), 먹선 칸(Maple) 대신
 * 10px 모서리의 흰 칸에 선 하나. 이름은 비었을 때 칸 안의 옅은 글씨였다가,
 * 손이 가거나 글이 차면 칸 바로 위로 올라가 12px 이름이 된다(선을 끊는 바탕 조각 없이).
 */
import styled from "styled-components";
import * as C from "../celestial/SingleInput.styles";
import { EASE, tideInput } from "@/styles/ocean/water";

export * from "../celestial/SingleInput.styles";

export const CelestialLabel = styled(C.CelestialLabel)`
    left: 12px;
    padding: 0;
    background-color: transparent;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: top 0.18s ${EASE}, transform 0.18s ${EASE}, font-size 0.18s ${EASE}, color 0.15s ease, left 0.18s ${EASE};
`;

export const CelestialInput = styled(C.CelestialInput)`
    ${tideInput}
    padding: 0 12px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    color: ${(p) => p.theme.colors.text};
    caret-color: ${(p) => p.theme.colors.primary};

    &:focus + .input-label, &:not(:placeholder-shown) + .input-label {
        top: 0;
        left: 2px;
        transform: translateY(calc(-100% - 5px));
        font-size: 0.75rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    &:focus + .input-label { color: ${(p) => p.theme.colors.primary}; }
`;
