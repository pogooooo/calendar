"use client";

import React from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import { celestial_defaultButton } from "@/styles/celestial_theme";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
}

const SecondaryButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    ${({ theme }) => {
        switch (theme.name) {
            case 'celestial': return celestial_defaultButton
            default: return celestial_defaultButton;
        }
    }}
`;

const CelestialSecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : SecondaryButton;
    return <Comp ref={ref} {...props} />;
});

CelestialSecondaryButton.displayName = 'CelestialSingleInput';

export default CelestialSecondaryButton;
