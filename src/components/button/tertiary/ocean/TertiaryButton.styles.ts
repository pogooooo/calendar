/**
 * 바다의 셋째 단추(글자 단추) — 밑줄 대신 물결 밑줄이 번져 나온다.
 */
import styled from "styled-components";
import * as C from "../celestial/TertiaryButton.styles";
import { waveUnderline } from "@/styles/ocean/water";

export * from "../celestial/TertiaryButton.styles";

export const TertiaryButton = styled(C.TertiaryButton)`
    font-family: ${(p) => p.theme.fonts.display};
    font-weight: 600;
    padding-bottom: 4px;
    ${waveUnderline(0.6)}
    background-size: 0 5px;
    transition: background-size 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
        text-decoration: none;
        background-size: 20px 5px;
    }
`;
