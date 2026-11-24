import { css } from "styled-components";
import { celestialOnly } from "./ornaments";

const inks = css`
    --ce-brass: ${p => p.theme.mode === "light" ? "#937633" : p.theme.colors.primary};
    --ce-night: ${p => p.theme.mode === "light" ? "#202B40" : p.theme.colors.background};
    --ce-star: ${p => p.theme.mode === "light" ? "#E1C773" : p.theme.colors.accent};
    --ce-paper: ${p => p.theme.colors.surface};
    --ce-ink: ${p => p.theme.colors.text};
    --ce-line: ${p => p.theme.colors.border};
    --ce-hover: color-mix(in srgb, var(--ce-paper) 88%, var(--ce-brass));
`;

const interaction = css`
    &:focus-visible { outline: 2px solid var(--ce-brass); outline-offset: 2px; }
    &:disabled { opacity: .58; cursor: default; }
    html[data-theme-motion="off"] &, html[data-theme-motion="off"] &::before { transition: none; animation: none; }
    @media (prefers-reduced-motion: reduce) { &, &::before { transition: none; animation: none; } }
`;

export const paperButton = celestialOnly(css`
    ${inks}
    position: relative;
    border: 1px solid var(--ce-brass);
    border-radius: 4px;
    color: var(--ce-ink);
    background: var(--ce-paper);
    box-shadow: inset 0 0 0 2px var(--ce-paper), inset 0 0 0 3px var(--ce-line);
    line-height: 1.25;
    &:hover:not(:disabled) { background: var(--ce-hover); border-color: var(--ce-brass); box-shadow: inset 0 0 0 2px var(--ce-hover), inset 0 0 0 3px var(--ce-brass); }
    &:active:not(:disabled) { transform: translateY(1px); }
    ${interaction}
`);

/** Navigation uses the glyph itself; focus and press remain visible on the full target. */
export const iconButton = celestialOnly(css`
    ${inks}
    ${interaction}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--ce-ink);
    border: 0;
    box-shadow: none;
    svg { display: block; flex: none; }
    &:hover:not(:disabled) { background: transparent; color: var(--ce-brass); }
    &:active:not(:disabled) { transform: translateY(1px); }
`);

export const field = celestialOnly(css`
    ${inks}
    background: var(--ce-paper);
    color: var(--ce-ink);
    border: 1px solid var(--ce-line);
    border-radius: 3px;
    box-shadow: none;
    &:hover:not(:disabled), &[aria-expanded="true"] { border-color: var(--ce-brass); box-shadow: none; }
    &:focus, &:focus-visible { border-color: var(--ce-brass); outline: 2px solid var(--ce-brass); outline-offset: 1px; box-shadow: none; }
    &::placeholder { color: ${p => p.theme.colors.textSecondary}; opacity: 1; }
    &[aria-invalid="true"] { border-color: ${p => p.theme.colors.error}; }
    &:disabled { opacity: .58; }
`);

export const corners = css`
    .ce-corners { position: absolute; inset: 0; pointer-events: none; color: var(--ce-brass); }
    .ce-corners > span { position: absolute; }
    .ce-corners .nw { top: 0; left: 0; }
    .ce-corners .ne { top: 0; right: 0; }
    .ce-corners .sw { bottom: 0; left: 0; }
    .ce-corners .se { bottom: 0; right: 0; }
    .ce-corners svg { width: 7px; height: 7px; }
`;

export const menuFrame = celestialOnly(css`
    ${inks}
    ${corners}
    box-sizing: border-box;
    background: var(--ce-paper);
    color: var(--ce-ink);
    border: 1px solid var(--ce-brass);
    border-radius: 4px;
    padding: 6px;
    box-shadow: inset 0 0 0 2px var(--ce-paper), inset 0 0 0 3px var(--ce-line), 0 4px 10px #0002;
    .ce-crown { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 1px 8px 4px; color: var(--ce-brass); pointer-events: none; }
    .ce-crown::before, .ce-crown::after { content: ""; flex: 1; border-top: 1px solid var(--ce-line); }
    ${interaction}
`);

export const optionRow = celestialOnly(css`
    ${inks}
    opacity: 1;
    text-decoration: none;
    color: var(--ce-ink);
    background: var(--ce-paper);
    border: 1px solid transparent;
    border-radius: 2px;
    &:hover:not(:disabled) { background: var(--ce-hover); border-color: var(--ce-line); }
    &[aria-selected="true"], &[aria-pressed="true"] {
        color: var(--ce-star); background: var(--ce-night); border-color: var(--ce-brass);
        &:hover:not(:disabled) { color: var(--ce-star); background: var(--ce-night); border-color: var(--ce-star); }
    }
    ${interaction}
    &:focus-visible { outline-offset: -3px; }
`);

export const moonRing = css`
    position: relative;
    display: inline-grid;
    place-items: center;
    padding: 0;
    border: 1px solid currentColor;
    border-radius: 50%;
    color: ${p => p.theme.mode === "light" ? "#806627" : p.theme.colors.primary};
    background: transparent;
    box-shadow: none;
    &::after { content: ""; width: 55%; height: 55%; border-radius: 50%; background: currentColor; }
`;

export const actionButton = celestialOnly(css<{ $variant?: "default" | "primary" | "danger" }>`
    && {
        ${paperButton}
        gap: 5px;
        .ce-seal { flex-shrink: 1; min-width: 0; }
        font-family: inherit;
        font-weight: 600;
        ${p => p.$variant === "primary" && css`
            background: ${p.theme.colors.primary}; color: #352A10;
            border-color: var(--ce-brass);
            box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}, inset 0 0 0 3px var(--ce-brass), 0 2px 0 var(--ce-brass);
            &:hover:not(:disabled) { background: ${p.theme.colors.primary}; box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}, inset 0 0 0 3px currentColor, 0 2px 0 var(--ce-brass); }
            &:active:not(:disabled) { box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}, inset 0 0 0 3px var(--ce-brass); }
        `}
        ${p => p.$variant === "danger" && css`
            color: ${p.theme.colors.error}; border-color: currentColor; box-shadow: none;
            &:hover:not(:disabled) { border-color: currentColor; box-shadow: inset 0 0 0 1px currentColor; }
        `}
        @media (pointer: coarse) { min-height: 44px; }
    }
`);

export const switchControl = celestialOnly(css`
    min-width: 44px !important; width: 44px;
    .slider { right: auto; width: 42px; height: 22px; box-sizing: border-box; background: ${p => p.theme.colors.border}; border: 1px solid ${p => p.theme.colors.textSecondary}; }
    .slider::before { width: 14px; height: 14px; left: 3px; bottom: 3px; background: ${p => p.theme.colors.surface}; box-shadow: none; transition: transform .14s ease-out; }
    input:checked + .slider { background: ${p => p.theme.mode === "light" ? "#202B40" : p.theme.colors.background}; border-color: ${p => p.theme.colors.primary}; }
    input:checked + .slider::before { background: ${p => p.theme.colors.primary}; transform: translateX(20px); }
    input:disabled + .slider { opacity: .58; }
    html[data-theme-motion="off"] & .slider, html[data-theme-motion="off"] & .slider::before { transition: none; }
    @media (prefers-reduced-motion: reduce) { .slider, .slider::before { transition: none; } }
    @media (pointer: coarse) { height: 44px; .slider { top: 11px; } }
`);

/** Calendar actions sit on the chart paper; the add action gets a closed brass rim. */
export const chartControl = css`
    ${inks}
    color: var(--ce-ink);
    background: transparent;
    border: 0;
    border-radius: 5px;
    box-shadow: none;
    font-family: ${p => p.theme.fonts.body};
    font-weight: 600;
    &:hover:not(:disabled), &:focus-visible {
        color: var(--ce-ink);
        background: color-mix(in srgb, var(--ce-brass) 10%, transparent);
        box-shadow: none;
    }
    &:focus-visible { outline: 2px solid var(--ce-brass); outline-offset: 2px; }
    &:disabled { opacity: .62; }
`;

export const chartAdd = css`
    ${chartControl}
    border: 1px solid color-mix(in srgb, var(--ce-brass) 74%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ce-brass) 7%, transparent);
    .ce-seal { color: var(--ce-brass); flex: none; }
`;
