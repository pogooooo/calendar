/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialProjectHeader.styles';
import { gemHeading, gemControl } from '@/styles/gem/material';
import { inkOnFill } from '@/styles/color';
export * from '../celestial/CelestialProjectHeader.styles';

export const HeaderTitle = styled(Base.HeaderTitle)`
    ${gemHeading}
`;

export const HeaderActionButton = styled(Base.HeaderActionButton)`
    ${gemControl}
    &:last-child {
        background: ${({theme})=>theme.colors.primary};
        color: ${({theme})=>inkOnFill(theme.colors.primary)};
        border-color: ${({theme})=>theme.colors.primary};
        box-shadow: inset 0 1px 0 #FFFFFF35, inset 0 0 0 3px ${({theme})=>theme.colors.accent}22;
        text-shadow: none;
        &:hover { background: ${({theme})=>theme.colors.primary}; filter: brightness(1.06); }
    }
`;

export const Tab = styled(Base.Tab)`
    ${gemControl}
`;
