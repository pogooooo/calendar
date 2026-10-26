/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSettings.styles';
import { gemHeading, gemControl, gemField } from '@/styles/gem/material';
import { inkOnFill } from '@/styles/color';
export * from '../celestial/CelestialSettings.styles';

export const PageHeader = styled(Base.PageHeader)`
    ${gemHeading}
`;

export const SectionTitle = styled(Base.SectionTitle)`
    ${gemHeading}
`;

export const ThemeLabel = styled(Base.ThemeLabel)`
    ${gemHeading}
`;

export const ModeButton = styled(Base.ModeButton)`
    ${gemControl}
    color: ${({ theme, $active }) => $active ? inkOnFill(theme.colors.primary) : theme.colors.primary};
    &:hover:not([data-active='true']) {
        background: ${({ theme, $active }) => $active ? theme.colors.primary : `${theme.colors.primary}18`};
    }
`;

export const FormInput = styled(Base.FormInput)`
    ${gemField}
`;

export const FormButton = styled(Base.FormButton)`
    ${gemControl}
    border-color: ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : theme.colors.primary};
    background: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : 'transparent'};
    color: ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : $variant === 'primary' ? inkOnFill(theme.colors.primary) : theme.colors.primary};
    &:hover:not(:disabled) {
        border-color: ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : theme.colors.primary};
        background: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : $variant === 'danger' ? `${theme.colors.error}12` : `${theme.colors.primary}12`};
        box-shadow: 0 3px 12px ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : theme.colors.primary}20;
    }
`;

export const StatusMessage = styled(Base.StatusMessage)`
    border-left-color: ${({ theme, $type }) => $type === 'success' ? theme.colors.success : theme.colors.error};
    color: ${({ theme, $type }) => $type === 'success' ? theme.colors.success : theme.colors.error};
    background: ${({ theme, $type }) => $type === 'success' ? theme.colors.success : theme.colors.error}0A;
`;
