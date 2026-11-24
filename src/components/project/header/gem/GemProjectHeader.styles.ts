import styled from "styled-components";
import * as C from "../celestial/CelestialProjectHeader.styles";
import { gemstoneAction, gemstoneHeading, gemstonePill, gemstoneSlab } from "@/features/gem/GemWorkspace.styles";

export * from "../celestial/CelestialProjectHeader.styles";

export const Header = styled(C.Header)`
    ${gemstoneHeading}
    padding: 12px clamp(12px, 2vw, 24px);
    border: 1px solid var(--gem-line);
    border-radius: 14px;
`;

export const TitleText = styled(C.TitleText)`
    font-size: clamp(1.2rem, 2.1vw, 1.8rem);
    font-weight: 700;
    letter-spacing: -.02em;
`;

export const HeaderLine = styled(C.HeaderLine)`
    border: 0;
    height: 1px;
    background: var(--gem-gold-edge);
`;

export const HeaderActionButton = styled(C.HeaderActionButton)`
    ${gemstonePill}
    min-height: 40px;
    &:last-child { ${gemstoneAction} }
`;

export const Tab = styled(C.Tab)`
    ${gemstonePill}
    &::after { content: none; }
    &[aria-pressed="true"], &[aria-selected="true"] {
        ${gemstoneSlab}
        font-weight: 700;
    }
    &:hover { color: var(--gem-ink); }
    &[aria-pressed="true"]:hover:not(:disabled), &[aria-selected="true"]:hover:not(:disabled) { color: var(--gem-slab-ink); }
`;
