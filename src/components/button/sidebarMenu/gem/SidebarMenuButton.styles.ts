/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/SidebarMenuButton.styles';
import { gemControl } from '@/styles/gem/material';
export * from '../celestial/SidebarMenuButton.styles';

export const SidebarButton = styled(Base.SidebarButton)`
    ${gemControl}
    padding: 0 10px; min-height: 43px;
    border: 1px solid ${({theme,$active})=>$active ? theme.colors.accent+'85' : 'transparent'};
    background: ${({theme,$active})=>$active ? `linear-gradient(115deg,${theme.colors.primary}17,${theme.colors.accent}06)` : 'transparent'};
    color: ${({theme,$active})=>$active ? theme.colors.primary : theme.colors.textSecondary};
    box-shadow: ${({theme,$active})=>$active ? `inset 2px 0 0 ${theme.colors.accent}, inset 0 1px 0 ${theme.colors.surface}` : 'none'};
    &::before, &::after { display: none; }
    &:hover { background-size: auto; background-color: ${({theme})=>theme.colors.primary}09; }
    svg { width: 18px; height: 18px; stroke-width: 1.5; }
`;

export const Numeral = styled(Base.Numeral)`display: none;`;
