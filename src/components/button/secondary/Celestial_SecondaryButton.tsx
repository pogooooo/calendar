"use client";

import React from 'react';
import styled, {css} from 'styled-components';
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    $variant?: 'default' | 'danger' | 'primary';
}

const SecondaryButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    border-radius: 5px;
    transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    background-color: transparent;
    cursor: pointer;

    ${(props) => {
        if (props.$variant === 'danger') {
            return css`
                border: 1px solid ${(props) => props.theme.colors.error};
                color: ${(props) => props.theme.colors.error};
                
                &:hover {
                    border-color: ${(props) => props.theme.colors.error};
                    box-shadow: 0 0 10px ${(props) => props.theme.colors.error};
                }
            `;
        }
        if (props.$variant === 'primary') {
            return css`
                background-color: ${(props) => props.theme.colors.primary};
                border: 1px solid ${(props) => props.theme.colors.primary};
                color: ${(props) => props.theme.colors.surface || '#ffffff'};
                
                &:hover {
                    box-shadow: 0 0 10px ${(props) => props.theme.colors.primary};
                }
            `;
        }
        return css`
            border: 1px solid ${props.theme.colors.border};
            color: ${props.theme.colors.text};
            
            &:hover {
                border-color: ${props.theme.colors.primary};
                box-shadow: 0 0 10px 3px ${props.theme.colors.accent};
            }
        `;
    }}

    &:active {
        transform: scale(0.96);
    }
`;

const CelestialSecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, $variant = 'default', ...props }, ref) => {
    if (asChild) {
        return (
            <SecondaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </SecondaryButton>
        );
    }

    return <SecondaryButton ref={ref} $variant={$variant} {...props} />;
});

CelestialSecondaryButton.displayName = 'CelestialSecondaryInput';

export default CelestialSecondaryButton;
