import { css } from "styled-components";
import { TOUCH } from "@/styles/breakpoints";

export const gemIconSize = css`
    --gem-control-size: 32px;
    box-sizing: border-box;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: var(--gem-control-size);
    height: var(--gem-control-size);
    min-width: var(--gem-control-size);
    min-height: var(--gem-control-size);
    padding: 0;
    > svg { display: block; }
    ${TOUCH} { --gem-control-size: 44px; }
`;

export const gemButton = css`
    align-items: center;
    line-height: 1.25;
    border: 2px solid transparent;
    border-radius: var(--gem-radius);
    background: var(--gem-action);
    color: var(--gem-action-ink);
    box-shadow: inset 0 1px var(--gem-rim-light), inset 0 -1px var(--gem-rim-shade), 0 2px 5px #40294325;
    font-weight: 700;
    font-family: ${({ theme }) => theme.fonts.body};
    letter-spacing: 0;
    transition: box-shadow .18s ease, border-color .18s ease;
    text-shadow: 0 1px 2px #170b2280;
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: 3px; }
    &:active:not(:disabled) { box-shadow: inset 0 2px 4px #25102955; }
    &:disabled {
        background: var(--gem-panel);
        border-color: var(--gem-line);
        color: var(--gem-muted);
        box-shadow: none;
        opacity: .76;
    }
    @media (hover: hover) {
        &:hover:not(:disabled) { color: var(--gem-action-ink); background: var(--gem-action); border-color: transparent; box-shadow: var(--gem-hover-shadow); }
    }
    background-blend-mode: normal;
`;

export const gemQuietButton = css`
    align-items: center;
    line-height: 1.25;
    border: 2px solid transparent;
    border-radius: var(--gem-radius);
    background: var(--gem-control);
    color: var(--gem-ink);
    box-shadow: var(--gem-control-shadow);
    font-weight: 650;
    font-family: ${({ theme }) => theme.fonts.body};
    letter-spacing: 0;
    transition: border-color .18s ease, box-shadow .18s ease;
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: 3px; }
    &:active:not(:disabled) { box-shadow: inset 0 1px 4px #40294335; }
    @media (hover: hover) {
        &:hover:not(:disabled) { border-color: transparent; color: var(--gem-ink); box-shadow: var(--gem-hover-shadow); }
    }
    &:disabled { opacity: .64; }
    background-blend-mode: normal;
`;

export const gemField = css`
    border: 1px solid transparent;
    border-radius: var(--gem-radius);
    background: var(--gem-field);
    color: var(--gem-ink);
    box-shadow: inset 0 1px 3px #41224822;
    &::placeholder { color: var(--gem-muted); opacity: 1; }
    &:is(:focus-visible, [aria-invalid="true"]) { border-color: currentColor; }
    &[aria-invalid="true"] { border-color: ${({ theme }) => theme.colors.error}; }
    &:disabled { opacity: .7; }
`;

export const gemPanel = css`
    border: 1px solid var(--gem-frame, var(--gem-frame-gold));
    border-radius: 14px;
    background: var(--gem-panel);
    color: var(--gem-ink);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gem-frame, var(--gem-frame-gold)) 20%, transparent), var(--gem-panel-shadow);
`;
