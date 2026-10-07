/**
 * 바다의 셋째 단추(글자 단추) — 밑줄 없이 글씨만. 올리면 글씨가 진해지고 옅은 면이 깔린다.
 */
import styled from "styled-components";
import * as C from "../celestial/TertiaryButton.styles";
import { focusRing, ink } from "@/styles/ocean/water";

export * from "../celestial/TertiaryButton.styles";

export const TertiaryButton = styled(C.TertiaryButton)`
    font-family: ${(p) => p.theme.fonts.body};
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 8px;
    color: ${(p) => p.theme.colors.textSecondary};
    background-image: none;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
        text-decoration: none;
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)};
    }
    ${focusRing}
`;
