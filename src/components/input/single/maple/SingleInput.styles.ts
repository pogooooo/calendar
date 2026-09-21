/**
 * Maple 의 입력칸 — 종이 위의 먹선 칸 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/SingleInput.styles";
import { hair, inkInput } from "@/styles/maple/ink";

export * from "../celestial/SingleInput.styles";

export const CelestialLabel = styled(C.CelestialLabel)`
    font-family: ${(p) => p.theme.fonts.display};
    background-color: ${(p) => p.theme.colors.background};
    padding: 0 3px;
`;

export const CelestialInput = styled(C.CelestialInput)`
    ${inkInput}
    border-radius: 2px;
    padding: 7px 8px;

    &:focus { box-shadow: none; }

    &:focus + .input-label, &:not(:placeholder-shown) + .input-label {
        color: ${(p) => p.theme.colors.primary};
    }

    &:not(:focus):not(:placeholder-shown) + .input-label { color: ${(p) => hair(p.theme, 0.8)}; }
`;
