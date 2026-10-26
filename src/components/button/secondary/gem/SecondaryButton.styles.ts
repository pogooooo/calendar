/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import type { ButtonProps } from '../celestial/SecondaryButton.styles';
import { gemControl } from '@/styles/gem/material';
import { inkOnFill } from '@/styles/color';
export * from '../celestial/SecondaryButton.styles';

export const SecondaryButton = styled.button<ButtonProps>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: ${({ $width }) => typeof $width === 'number' ? `${$width}px` : $width || '100%'};
    height: ${({ $height }) => typeof $height === 'number' ? `${$height}px` : $height || '40px'};
    padding: 0 14px;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.body};
    font-weight: 500;
    cursor: pointer;
    border: 1px solid ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : $variant === 'primary' ? theme.colors.primary : theme.colors.border};
    background: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : 'transparent'};
    color: ${({ theme, $variant }) => $variant === 'primary' ? inkOnFill(theme.colors.primary) : $variant === 'danger' ? theme.colors.error : theme.colors.text};
    box-shadow: ${({ $variant }) => $variant === 'primary' ? 'inset 0 1px 0 #FFFFFF30, inset 0 -1px 0 #00000012' : 'none'};
    ${gemControl}
    &:hover:not(:disabled) {
        border-color: ${({ theme, $variant }) => $variant === 'danger' ? theme.colors.error : theme.colors.primary};
        background: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : $variant === 'danger' ? `${theme.colors.error}10` : `${theme.colors.primary}0A`};
        box-shadow: ${({ theme, $variant }) => `inset 0 1px 0 #FFFFFF15, 0 4px 14px ${$variant === 'danger' ? theme.colors.error : theme.colors.primary}25`};
    }
    &:disabled { cursor: not-allowed; opacity: .45; box-shadow: none; }
`;
