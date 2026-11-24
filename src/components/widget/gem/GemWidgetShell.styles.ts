import styled from "styled-components";
import * as Base from "../celestial/CelestialWidgetShell.styles";

export * from "../celestial/CelestialWidgetShell.styles";

export const Shell = styled(Base.Shell)`
    --widget-pad: 12px;
    border-color: var(--gem-line);
    border-radius: 16px;
`;

export const BackgroundSurface = styled(Shell)`
    ${Base.backdropLayer}

    &[data-ornate="true"]::after {
        position: absolute;
        inset: 0;
        background: var(--gem-panel);
        content: "";
    }
`;

export const TopBar = styled(Base.TopBar)`
    gap: 7px;
    padding-inline: 11px 6px;
    background: none;
    opacity: .76;
`;

export const Gem = styled(Base.Gem)`
    width: 22px;
    height: 6px;
    transform: none;
    border: 1px solid transparent;
    border-radius: var(--gem-radius);
    background: var(--gem-refraction-map) 42% center / 28px auto padding-box,
        var(--gem-gold-edge) border-box;
    box-shadow: none;

    &:hover { transform: none; border-color: transparent; box-shadow: none; }
`;

export const Rule = styled(Base.Rule)`
    background: none;
`;

export const Control = styled(Base.Control)`
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    color: var(--gem-ink);
    background: var(--gem-control);

    &[aria-expanded="true"] { background: var(--gem-action); color: var(--gem-action-ink); }
    &:hover { border-color: transparent; filter: brightness(1.06); }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
    ${p => p.$danger && `&:hover { background: ${p.theme.colors.error}; color: #fff; }`}
`;
