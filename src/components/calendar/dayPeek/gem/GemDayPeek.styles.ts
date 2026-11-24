import styled, { css } from "styled-components";
import { gemCalendarNav, gemCalendarToday } from "../../gemCalendarStyles";
import * as Base from "../celestial/CelestialDayPeek.styles";

export * from "../celestial/CelestialDayPeek.styles";

export const Wrap = styled(Base.Wrap)`
    --gem-peek-ink: var(--gem-ink);
    --gem-peek-rule: var(--gem-line);
    box-sizing: border-box;
    padding-inline: 11px;
    border: 1px solid var(--gem-gold);
    border-radius: 9px;
    background: var(--gem-day-stone);
    color: var(--gem-peek-ink);
    .gem-peek-actions { display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--gem-peek-rule); }
    .gem-peek-actions [data-day-peek-head] { flex: 1 1 auto; min-width: 0; border-bottom: 0; }
    html[data-presentation="mobile-app"] & {
        --gem-peek-ink: var(--gem-ink);
        --gem-peek-rule: var(--gem-line);
        background: var(--gem-panel);
        border-color: var(--gem-line);
    }
`;

export const Add = styled.button`
    ${gemCalendarNav}
    width: 44px;
    height: 44px;
    flex: none;
`;

export const Head = styled(Base.Head)`
    &&[data-day-peek-head], html[data-presentation="mobile-app"] &&[data-day-peek-head] {
        color: var(--gem-peek-ink);
    }
    min-height: 44px;
    gap: 7px;
    border-block-end: 1px solid var(--gem-peek-rule);
    font-family: ${p => p.theme.fonts.body};
    font-variant-numeric: tabular-nums;
    padding-right: 0;
    .title { white-space: normal; overflow-wrap: anywhere; }
    .hd {
        ${p => p.$today ? gemCalendarToday : css`
            width: 9px; height: 9px; border-color: var(--gem-peek-rule);
            border-radius: 3px; background: transparent;
        `}
        transform: none;
    }
    .hr { background: none; }
    b, .open { color: inherit; }
    &:active .open { color: inherit; }
`;

export const List = styled(Base.List)`
    overflow: visible;
    padding-block-end: 0;
`;

export const Row = styled(Base.Row)`
    padding-right: 0;
    color: var(--gem-peek-ink);
    border-color: color-mix(in srgb, var(--gem-peek-rule) 58%, transparent);
    gap: 8px;
    .mark { border-radius: 50%; transform: none; }
    .name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        white-space: normal;
        overflow-wrap: anywhere;
        text-decoration-color: currentColor;
    }
    em { color: inherit; }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
`;

export const Empty = styled(Base.Empty)`color: var(--gem-peek-ink);`;

export const More = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: 44px;
    border: 0;
    color: var(--gem-peek-ink);
    background: transparent;
    font-weight: 700;
    font-size: .79rem;
    border-radius: var(--gem-radius);
    @media (hover: hover) {
        &:hover { background: color-mix(in srgb, var(--gem-peek-ink) 10%, transparent); }
    }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
`;
