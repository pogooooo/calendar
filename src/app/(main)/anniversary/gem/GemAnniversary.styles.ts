/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialAnniversary.styles';
import { gemHeading, gemPanel, gemControl, gemField } from '@/styles/gem/material';
import { inkOnFill } from '@/styles/color';
export * from '../celestial/CelestialAnniversary.styles';

export const Zodiac = styled(Base.Zodiac)`display: none;`;

export const Corners = styled(Base.Corners)`
    i { width: 9px; height: 9px; border: 0; background: transparent; transform: none; color: ${({ theme }) => theme.colors.accent}; }
    i:nth-child(1) { top: 3px; left: 3px; border-top: 1px solid; border-left: 1px solid; }
    i:nth-child(2) { top: 3px; right: 3px; border-top: 1px solid; border-right: 1px solid; }
    i:nth-child(3) { bottom: 3px; left: 3px; border-bottom: 1px solid; border-left: 1px solid; }
    i:nth-child(4) { bottom: 3px; right: 3px; border-bottom: 1px solid; border-right: 1px solid; }
`;

export const PageHeader = styled(Base.PageHeader)`
    ${gemHeading}
    i { width: 10px; height: 13px; border: 0; transform: none; background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.accent}, ${theme.gemColor ?? theme.colors.primary})`}; clip-path: polygon(25% 0,75% 0,100% 28%,100% 72%,75% 100%,25% 100%,0 72%,0 28%); }
    span { letter-spacing: .035em; }
`;

export const AddForm = styled(Base.AddForm)`
    ${gemPanel}
`;

export const IconChoice = styled(Base.IconChoice)`
    ${gemControl}
    border-color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.border};
    background: ${({ theme, $selected }) => $selected ? `${theme.colors.primary}12` : 'transparent'};
    box-shadow: ${({ theme, $selected }) => $selected ? `inset 0 -2px 0 ${theme.colors.primary}` : 'none'};
    svg { filter: none; }
`;

export const TitleInput = styled(Base.TitleInput)`
    ${gemField}
`;

export const AddButton = styled(Base.AddButton)`
    ${gemControl}
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => inkOnFill(theme.colors.primary)};
    &:hover:not(:disabled), &:active:not(:disabled) { background: ${({ theme }) => theme.colors.primary}; }
`;

export const Card = styled(Base.Card)`
    ${gemPanel}
    border-color: ${({ theme, $today }) => $today ? theme.colors.primary : `${theme.colors.accent}52`};
    background: ${({ theme, $today }) => $today ? `radial-gradient(ellipse at 50% 0%, ${theme.colors.primary}18, transparent 75%), ${theme.colors.surface}` : `linear-gradient(135deg, ${theme.colors.surface}F2, ${theme.colors.background}E8)`};
    color: ${({ theme }) => theme.colors.text};
    animation: none;
    box-shadow: ${({ theme, $today }) => $today ? `inset 0 3px 0 ${theme.colors.primary}, 0 8px 28px ${theme.colors.primary}12` : `inset 0 1px 0 ${theme.colors.accent}18, 0 8px 28px ${theme.colors.text}07`};
    &::before { border-color: ${({ theme }) => theme.colors.accent}20; border-radius: 1px 11px 1px 11px; }
    &:hover::before { border-color: ${({ theme }) => theme.colors.accent}55; }
    &:focus-within button { opacity: 1; }
    @media (hover: none) { button { opacity: 1; } }
`;

export const CardTitle = styled(Base.CardTitle)`
    ${gemHeading}
    font-size: 1.08rem;
`;

export const CardEmblem = styled(Base.CardEmblem)`
    > svg .dia { display: none; }
    > svg .orbit { stroke: ${({ theme }) => theme.colors.accent}38; }
    > svg .orbit-fill { stroke: ${({ theme }) => theme.colors.primary}; stroke-width: 1.5; }
    .glyph { color: ${({ theme }) => theme.colors.primary}; }
    .glyph svg { filter: none; }
`;

export const CardDday = styled(Base.CardDday)`
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: .78rem;
    letter-spacing: .03em;
    &::after {
        content: ${({ $today }) => $today ? "''" : 'none'};
        width: 6px; height: 9px;
        background: ${({ theme }) => theme.colors.primary};
        clip-path: polygon(25% 0,75% 0,100% 28%,100% 72%,75% 100%,25% 100%,0 72%,0 28%);
    }
`;
