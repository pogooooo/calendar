/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialCategory.styles';
import { gemHeading, gemPanel, gemFocus } from '@/styles/gem/material';
export * from '../celestial/CelestialCategory.styles';

export const SLENDER_STAR_48 = 'M17 6H31L39 16V32L31 42H17L9 32V16Z M17 6L20 17H28L31 6 M9 16L20 17L16 25L9 32 M39 16L28 17L32 25L39 32 M17 42L20 31H28L31 42 M20 17L16 25L20 31H28L32 25L28 17';

export const CategoryWrapper = styled(Base.CategoryWrapper)`background: transparent;`;
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

export const DeckCard = styled(Base.DeckCard)`
    ${gemPanel}
    ${gemFocus}
    border-color: ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : `${theme.colors.accent}42`};
    background: ${({ theme, $isSelected }) => $isSelected ? `linear-gradient(110deg, ${theme.colors.primary}15, ${theme.colors.surface})` : `${theme.colors.surface}B0`};
    box-shadow: ${({ theme, $isSelected }) => $isSelected ? `inset 3px 0 0 ${theme.colors.primary}, inset 0 1px 0 ${theme.colors.accent}20` : 'none'};
    transform: none;
    &::before { display: none; }
    &:hover { transform: translateY(-1px); border-color: ${({ theme }) => theme.colors.primary}; }
    .chip { width: 10px; height: 13px; clip-path: polygon(25% 0,75% 0,100% 28%,100% 72%,75% 100%,25% 100%,0 72%,0 28%); background-image: linear-gradient(135deg, #FFFFFF65, transparent 45%, #00000020); }
    .nm { font-family: ${({ theme }) => theme.fonts.body}; font-weight: ${({ $isSelected }) => $isSelected ? 600 : 400}; }
    .mark { font-size: 0; }
    .mark::after { content: ''; display: block; width: 6px; height: 9px; background: ${({ theme }) => theme.colors.primary}; clip-path: polygon(25% 0,75% 0,100% 28%,100% 72%,75% 100%,25% 100%,0 72%,0 28%); }
    html[data-theme-motion='off'] & { animation: none; transition: none; transform: none; }
`;

export const DeckAddCard = styled(Base.DeckAddCard)`
    ${gemFocus}
    border-style: dashed;
    border-color: ${({ theme }) => theme.colors.border};
    border-radius: 3px 12px 3px 12px;
    background: transparent;
    &:hover { box-shadow: none; background: ${({ theme }) => theme.colors.primary}08; }
`;

export const Plate = styled(Base.Plate)`
    ${gemPanel}
`;

export const TodoCard = styled(Base.TodoCard)`
    ${gemPanel}
    &::before { display: none; }
    .check-btn { border-radius: 2px 5px 2px 5px; box-shadow: none; }
    &:focus-within .delete-btn { opacity: 1; }
    @media (hover: none) { .delete-btn { opacity: 1; } }
`;

export const ModalContent = styled(Base.ModalContent)`
    ${gemPanel}
`;

export const EmblemWrap = styled(Base.EmblemWrap)`
    svg .ring { display: none; }
    svg .star { fill: ${({ $color }) => $color}12; stroke-width: 1; }
    &:focus-within { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 4px; border-radius: 5px; }
`;

export const DetailHeader = styled(Base.DetailHeader)`
    button { font-family: ${({ theme }) => theme.fonts.body}; letter-spacing: 0; text-shadow: none !important; }
`;

export const EmptyStateContainer = styled(Base.EmptyStateContainer)`
    svg .ring { display: none; }
    svg .star { fill: ${({ theme }) => theme.gemColor ?? theme.colors.primary}12; }
`;
