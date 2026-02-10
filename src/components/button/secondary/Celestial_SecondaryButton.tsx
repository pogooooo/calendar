"use client";

import React from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
}

const SecondaryButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.text};
    border-radius: 5px;
    transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    
    &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 10px 3px ${(props) => props.theme.colors.accent};
    }
`;

const CelestialSecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    if (asChild) {
        return (
            <SecondaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </SecondaryButton>
        );
    }

    return <SecondaryButton ref={ref} {...props} />;
});

CelestialSecondaryButton.displayName = 'CelestialSecondaryInput';

export default CelestialSecondaryButton;
