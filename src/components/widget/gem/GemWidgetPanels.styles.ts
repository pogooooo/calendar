import styled from "styled-components";
import * as Base from "../celestial/CelestialWidgetPanels.styles";

export * from "../celestial/CelestialWidgetPanels.styles";

export const DayNav = styled(Base.DayNav)`
    .label {
        font-family: ${p => p.theme.fonts.display};
        letter-spacing: 0;
    }
`;

export const SectionHead = styled(Base.SectionHead)`
    font-family: ${p => p.theme.fonts.display};
    font-weight: 700;
    letter-spacing: .015em;
    border-bottom-color: var(--gem-line);
`;

export const Mark = styled(Base.Mark)`
    transform: none;
    border-radius: 50%;
`;

export const Star = styled(Base.Star)`
    font-size: 0;
    width: 8px;
    height: 8px;
    border: 1px solid var(--gem-gold);
    border-radius: 50%;
`;

export const Name = styled(Base.Name)`transition: none;`;

export const Box = styled(Base.Box)`
    border-radius: 50%;
    border-color: var(--gem-gold);
    background-image: ${p => p.$done ? "var(--gem-gold-vein-map)" : "none"};
    background-position: 45% center;
    background-size: cover;
    color: #fff6fb;
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;

export const QuickInput = styled(Base.QuickInput)`
    min-width: 0;
    padding-inline: 12px;
    border-radius: var(--gem-radius);
    border-color: var(--gem-line);
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
`;

export const AddBtn = styled(Base.AddBtn)`
    border: 1px solid transparent;
    border-radius: var(--gem-radius);
    color: var(--gem-action-ink);
    background: var(--gem-action);
    &:hover:not(:disabled) { border-color: transparent; filter: brightness(1.05); }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;

export const DelBtn = styled(Base.DelBtn)`
    border-radius: 50%;
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
`;
