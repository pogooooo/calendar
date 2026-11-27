import styled from 'styled-components';
import { ornamentStrokes } from '@/components/ornament/celestial/CelestialOrnaments.styles';
import { Check, Open } from '../HomeTaskActions.styles';
import { Empty, ListCol, Mark, QuickForm, Row, Scroll, SectionHead } from './CelestialHome.styles';

export const LunarDivider = styled.svg`
    ${ornamentStrokes}
    display: block;
    flex: none;
    width: min(11.6rem, 78%);
    height: auto;
    align-self: center;
    margin-top: auto;
    padding-top: 1rem;
    box-sizing: content-box;
    stroke-width: 1.5;
    color: var(--reading-brass);
    pointer-events: none;
`;

export const Frame = styled(ListCol)`
    --reading-brass: ${p => p.theme.mode === 'light' ? '#937633' : p.theme.colors.primary};
    --reading-line: color-mix(in srgb, var(--reading-brass) 76%, transparent);
    --reading-fine: color-mix(in srgb, var(--reading-brass) 35%, transparent);
    --reading-paper: ${p => p.theme.colors.background};
    --reading-tab: color-mix(in srgb, var(--reading-paper) 36%, ${p => p.theme.colors.primary});
    position: relative;
    padding: 24px 22px 16px;
    min-height: 27.4rem;
    border: 1px solid var(--reading-line);
    background: transparent;

    &::before {
        content: '';
        position: absolute;
        inset: 6px;
        border: 1px solid var(--reading-fine);
        pointer-events: none;
    }
    &::after {
        content: '✦';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        padding-inline: 7px;
        background: var(--reading-paper);
        color: ${p => p.theme.colors.primary};
        font: 0.875rem/1 serif;
        pointer-events: none;
    }
    ${SectionHead} {
        position: relative;
        padding: 3px 4px;
        margin-bottom: 16px;
        min-height: 24px;
        outline: 1px solid var(--reading-line);
        outline-offset: 3px;
        color: ${p => p.theme.colors.text};
        font-size: .84rem;
        letter-spacing: .035em;
        b { min-width: 2ch; text-align: end; }
    }
    ${QuickForm} {
        gap: 0;
        padding: 0;
        min-height: 36px;
        margin-bottom: 13px;
        border: 1px solid var(--reading-line);
        border-radius: 0;
        background: transparent;
        input { padding-inline: 8px; }
        button {
            align-self: stretch;
            padding: 0;
            border: 0;
            border-inline-start: 1px solid var(--reading-fine);
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            color: var(--reading-brass);
        }
        button[type=submit] {
            background: var(--reading-tab);
            box-shadow: inset 0 0 0 3px var(--reading-tab), inset 0 0 0 4px var(--reading-line);
            color: #292312;
        }
        button:hover:enabled, button:focus-visible {
            background: ${p => p.theme.colors.surface};
            box-shadow: inset 0 0 0 1px var(--reading-brass);
            color: ${p => p.theme.colors.text};
        }
        &:focus-within { border-color: var(--reading-brass); outline: 1px solid var(--reading-fine); }
    }
    ${Scroll} {
        flex: 0 1 auto;
        display: grid;
        align-content: start;
        gap: 5px;
        padding: 2px;
        border: 1px solid var(--reading-fine);
        outline: 1px solid var(--reading-fine);
        outline-offset: 2px;
    }
    ${Row} {
        box-sizing: border-box;
        min-height: 44px;
        padding-inline: 10px;
        border: 1px solid transparent;
        border-bottom-color: var(--reading-fine);
        color: ${p => p.theme.colors.text};
        &:last-child { border-bottom-color: transparent; }
        em { color: ${p => p.theme.colors.textSecondary}; letter-spacing: .035em; }
        &:is(:hover, :focus-visible, :focus-within) {
            border-color: var(--reading-brass);
            box-shadow: inset 0 0 0 2px var(--reading-paper), inset 0 0 0 3px var(--reading-fine);
            color: ${p => p.theme.colors.text};
        }
        &:hover ${Mark} { box-shadow: none; }
    }
    ${Check} { width: 32px; min-height: 42px; }
    ${Open} {
        min-height: 42px;
        gap: 7px;
        padding: 6px 9px 6px 0;
        .name { white-space: normal; }
        svg { width: 12px; color: var(--reading-brass); }
    }
    ${Mark} { width: 12px; height: 12px; }
    ${Empty} { padding: 18px 8px; text-align: center; }

    @media (max-width: 768px) {
        min-height: 0;
        padding: 19px 16px 12px;
        ${Scroll} { grid-template-columns: minmax(0, 1fr); }
        ${LunarDivider} { width: 9rem; padding-top: .625rem; }
    }
    @media (pointer: coarse) {
        ${Check}, ${QuickForm} button { min-width: 44px; min-height: 44px; }
        ${Open} { min-height: 44px; }
        ${QuickForm} input { min-height: 44px; font-size: max(1rem, 16px); }
    }
    [data-theme-layout='mobile-home'] & {
        min-height: 0;
        padding: 14px 12px 10px;
        &::before, &::after { display: none; }
        ${LunarDivider} { width: 7.25rem; padding-top: .4rem; }
        ${Scroll} { outline: none; gap: 2px; }
    }
`;
