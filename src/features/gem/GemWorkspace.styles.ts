import { css } from "styled-components";
import { gemButton, gemPanel, gemQuietButton } from "./GemLive.styles";

export const gemstonePanel = css`
    ${gemPanel}
    min-width: 0;
`;

export const gemstoneHeading = css`
    color: var(--gem-ink);
    background: var(--gem-heading);
    border-color: var(--gem-frame, var(--gem-frame-gold));
`;

export const gemstoneSlab = css`
    color: var(--gem-slab-ink);
    background: var(--gem-rail);
    border: 1px solid color-mix(in srgb, var(--gem-gold) 58%, transparent);
`;

export const gemstonePill = css`
    ${gemQuietButton}
    &:focus-visible { outline: 2px solid var(--gem-gold); outline-offset: 2px; }
`;

export const gemstoneAction = css`
    ${gemButton}
    &:focus-visible { outline: 2px solid var(--gem-gold); outline-offset: 2px; }
`;
