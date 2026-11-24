import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { MOBILE, TOUCH } from "@/styles/breakpoints";
import { gemstoneAction, gemstonePill } from "@/features/gem/GemWorkspace.styles";
import { gemIconSize } from "@/features/gem/GemLive.styles";

export * from "../celestial/CelestialHome.styles";

export const ArchWrap = styled(C.ArchWrap)`
    display: contents;
`;

export const ArchFoot = styled(C.ArchFoot)`
    grid-area: foot;
    justify-content: flex-start;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
    font-family: ${p => p.theme.fonts.body};
    color: var(--gem-muted);
    letter-spacing: 0;
    .center { font-family: ${p => p.theme.fonts.body}; font-size: .78rem; letter-spacing: 0; }
    .center i { display: none; }
`;

export const DayNav = styled(C.DayNav)`
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 6px;
    padding: 0;
`;

export const NavButton = styled(C.NavButton)`
    ${gemstonePill}
    ${gemIconSize}
    opacity: 1;
    &:hover { filter: none; }
    svg { width: 16px; }
`;

export const DayPick = styled(C.DayPick)`
    min-width: 0;
    & > button {
        ${gemstonePill}
        min-height: 36px;
        padding-block: 0;
        font-weight: 700;
        font-family: ${p => p.theme.fonts.body};
        letter-spacing: 0;
        width: auto;
        ${TOUCH} { min-height: 44px; }
    }
`;

export const TodayButton = styled(C.TodayButton)`
    ${gemstonePill}
    display: inline-flex;
    justify-content: center;
    min-height: 36px;
    padding-block: 0;
    ${TOUCH} { min-height: 44px; }
    ${MOBILE} { flex-basis: auto; }
`;

export const SectionHead = styled(C.SectionHead)`
    color: var(--gem-ink);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -.015em;
    .hd { transform: none; border: 0; border-radius: 50%; background: var(--gem-gold-edge); }
    .hr { background: var(--gem-gold-edge); opacity: .65; }
`;

export const QuickForm = styled(C.QuickForm)`
    &[data-home-quick] {
        border-color: transparent;
        border-radius: var(--gem-radius);
        background: var(--gem-field);
        padding: 2px;
    }
    &&:hover { border-color: var(--gem-line); }
    &:focus-within { box-shadow: 0 0 0 2px var(--gem-line); }
    .dot { transform: none; border-radius: 50%; }
    input { min-height: 40px; font-size: max(16px, .94rem); color: var(--gem-ink); }
    input::placeholder { color: var(--gem-muted); }
    button {
        ${gemstonePill}
        align-self: center;
        min-height: 40px;
        width: 40px;
        padding: 0;
        svg { display: block; }
    }
    button[type="submit"] { ${gemstoneAction} ${gemIconSize} }
    ${TOUCH} { button { min-height: 44px; } }
    && button.detail {
        width: auto;
        min-width: 44px;
        padding-inline: 8px;
        border-color: transparent;
        background: transparent;
        color: var(--gem-muted);
        font-size: .75rem;
        font-weight: 650;
        white-space: nowrap;
        &:hover { background: var(--gem-control); color: var(--gem-ink); }
    }
`;

export const Mark = styled(C.Mark)`
    border-radius: 50%;
    transform: none;
    ${p => p.$on && css`
        border-color: var(--gem-gold);
        background: var(--gem-action);
    `}
`;

export const Row = styled(C.Row)`
    font-family: ${p => p.theme.fonts.body};
    font-size: ${p => p.$soft ? ".86rem" : ".93rem"};
    line-height: 1.5;
    color: ${p => p.$done ? "var(--gem-muted)" : "var(--gem-ink)"};
    .name { font-weight: ${p => p.$done ? 500 : 600}; }
    &[aria-busy="true"] { color: var(--gem-muted); }
    em { font-family: ${p => p.theme.fonts.body}; font-size: .78rem; letter-spacing: 0; color: var(--gem-muted); }
    &:hover { color: ${p => p.$done ? "var(--gem-muted)" : "var(--gem-ink)"}; }
    &:hover ${C.Mark} { box-shadow: none; }
`;

export const RepeatedGroup = styled.details`
    border-block-end: 1px solid color-mix(in srgb, var(--gem-line) 40%, transparent);
    summary {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 9px 3px;
        font-size: .86rem;
        font-weight: 600;
    }
    summary::-webkit-details-marker { display: none; }
    summary > span { min-width: 0; overflow-wrap: anywhere; }
    summary > em { margin-inline-start: auto; color: var(--gem-muted); font-style: normal; white-space: nowrap; }
    summary::after {
        content: "";
        border: solid var(--gem-muted);
        border-width: 0 1.5px 1.5px 0;
        width: 6px;
        height: 6px;
        rotate: 45deg;
        flex: none;
    }
    &[open] summary::after { rotate: 225deg; }
    > button { padding-inline: 18px 12px; }
`;

export const PillarHead = styled(C.PillarHead)`
    border-radius: var(--gem-radius);
    letter-spacing: 0;
    color: var(--gem-ink);
    font: 700 .86rem/1.4 ${p => p.theme.fonts.body};
    .idx { display: none; }
    .rule { background: var(--gem-gold-edge); }
`;

export const PillarAdd = styled(C.PillarAdd)`${gemstonePill}`;
export const Slot = styled(C.Slot)`
    border-radius: 50%;
    transform: none;
    &::after { border-radius: 50%; transform: none; box-shadow: none; }
    ${p => p.$on && css`
        background: var(--gem-action);
        color: var(--gem-action-ink);
        ${MOBILE} { background: none; &::after { background: var(--gem-action); } }
    `}
`;

export const AnvForm = styled(C.AnvForm)`
    input { border-radius: var(--gem-radius); }
    button { ${gemstoneAction} }
`;
