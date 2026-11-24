import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { gemstoneHeading, gemstonePanel } from "@/features/gem/GemWorkspace.styles";

export const Home = styled.div`
    width: min(100%, 1280px);
    margin-inline: auto;
    display: grid;
    gap: 20px;
    padding-block-end: 24px;
    color: var(--gem-ink);
    font-family: ${({ theme }) => theme.fonts.body};
`;

export const Header = styled.header`
    ${gemstonePanel}
    ${gemstoneHeading}
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: "date nav" "ribbon ribbon" "foot foot";
    align-items: center;
    gap: 12px 24px;
    padding: clamp(16px, 2.4vw, 28px);
    background: var(--gem-home-hero-map, none) 45% 56% / cover no-repeat, var(--gem-surface);

    nav { grid-area: nav; }
    ${MOBILE} {
        grid-template-columns: minmax(0, 1fr); grid-template-areas: "date" "nav" "ribbon" "foot";
    }
`;

export const DateTitle = styled.div`
    grid-area: date;
    min-width: 0;
    color: var(--gem-ink);

    small { display: block; color: var(--gem-muted); font-size: .8rem; font-weight: 700; }
    strong {
        display: block;
        font: 700 clamp(1.65rem, 3.1vw, 2.8rem)/1.3 ${p => p.theme.fonts.body};
        letter-spacing: -.04em;
        font-variant-numeric: lining-nums tabular-nums;
    }
`;

export const MonthRibbon = styled.div`
    grid-area: ribbon;
    position: relative;
    min-width: 0;
`;

export const RibbonTrack = styled.div`
    min-width: 0;
    display: flex;
    gap: clamp(2px, .38vw, 5px);
    height: 22px;
    align-items: end;
    --ribbon-duration: 300ms;
    html[data-theme-motion="gentle"] & { --ribbon-duration: 160ms; }

    i {
        position: relative;
        flex: 1;
        min-width: 0;
        height: calc(5px + 2px * var(--load, 0));
        border-radius: var(--gem-radius);
        background: color-mix(in srgb, var(--gem-slab) 40%, var(--gem-surface));
        transition: height var(--ribbon-duration) ease-out;
    }
    i::after {
        content: "";
        position: absolute;
        inset: auto 0 0;
        box-sizing: border-box;
        height: max(16px, 100%);
        border: 1px solid transparent;
        border-radius: 4px;
        background: var(--gem-action);
        opacity: 0;
        transform: scaleY(.35);
        transform-origin: bottom;
        transition: opacity var(--ribbon-duration) ease, transform var(--ribbon-duration) cubic-bezier(.22, .82, .25, 1);
    }
    [data-active]::after {
        opacity: 1;
        transform: scaleY(1);
    }
    [data-marked] { box-shadow: 0 -2px var(--gem-gold); }
    [data-today]::before {
        content: "";
        position: absolute;
        inset: auto 23% -4px;
        height: 2px;
        border-radius: 999px;
        background: var(--gem-gold);
    }
    html[data-theme-mode="dark"] & i {
        background: color-mix(in srgb, var(--gem-ink) 27%, var(--gem-surface));
    }
`;

export const ReadingGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.28fr) minmax(0, 1fr);
    gap: 18px;
    align-items: start;

    > * {
        ${gemstonePanel}
        background: var(--gem-calendar-quartz-map, none) 48% 47% / cover no-repeat, var(--gem-surface);
        min-height: 0;
        padding: clamp(14px, 2vw, 24px);
    }
    > :last-child {
        --gem-frame: var(--gem-frame-silver);
        background: var(--gem-record);
    }
    ${MOBILE} { grid-template-columns: minmax(0, 1fr); > * { min-height: 0; } }
`;

export const Collections = styled.aside`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;

    > section {
        ${gemstonePanel}
        background: var(--gem-panel);
        padding: clamp(14px, 1.8vw, 22px);
    }
    > section:nth-child(2) {
        --gem-frame: var(--gem-frame-silver);
        background: var(--gem-home-quartz-map, none) 75% 63% / cover no-repeat, var(--gem-surface);
    }
    > section:last-child {
        background: var(--gem-home-pearl-map, none) 18% 46% / cover no-repeat, var(--gem-surface);
    }
    .mt { margin-top: 0; }
    @media (max-width: 940px) { grid-template-columns: minmax(0, 1fr); }
`;
