"use client";

import React from 'react';
import styled, { css } from 'styled-components';
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

    border-radius: 8px 8px 8px 0;
    transition: all 0.2s ease;
    font-size: ${(props) => props.theme.fontSizes.body};
    font-family: ${(props) => props.theme.fonts.body};
    background-color: transparent;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    ${(props) => {
        if (props.$variant === 'danger') {
            return css`
                border: 1px solid ${(props) => props.theme.colors.error};
                color: ${(props) => props.theme.colors.error};

                &:hover {
                    background-color: ${(props) => props.theme.colors.error}10;
                    border-color: ${(props) => props.theme.colors.error};
                }
            `;
        }
        if (props.$variant === 'primary') {
            return css`
                background-color: ${(props) => props.theme.colors.primary};
                border: 1px solid ${(props) => props.theme.colors.primary};
                border-left: 2px solid ${(props) => props.theme.colors.primary};
                color: ${(props) => props.theme.colors.background};

                &:hover {
                    box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.5);
                    opacity: 0.9;
                }
            `;
        }
        return css`
            border: 1px solid ${props.theme.colors.border};
            border-left: 2px solid ${props.theme.colors.primary}60;
            color: ${props.theme.colors.text};

            &:hover {
                border-left-color: ${props.theme.colors.primary};
                background-color: ${props.theme.colors.primary}0E;
                box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.3);
            }
        `;
    }}

    &:active {
        transform: scale(0.97);
    }
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const LiteSecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, $variant = 'default', ...props }, ref) => {
    if (asChild) {
        return (
            <SecondaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </SecondaryButton>
        );
    }

    return <SecondaryButton ref={ref} $variant={$variant} {...props} />;
});

LiteSecondaryButton.displayName = 'LiteSecondaryButton';

export default LiteSecondaryButton;
