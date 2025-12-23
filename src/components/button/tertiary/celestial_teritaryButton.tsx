"use client";

import * as React from 'react';
import styled, {useTheme} from 'styled-components';
import {celestial_tertiaryButton} from "@/styles/celestial_theme";
import {Slot} from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $label?: string;
}

const TertiaryButton = styled.button`
    ${({theme}) => {
        switch (theme.name) {
            case 'celestial': return celestial_tertiaryButton;
            default: return celestial_tertiaryButton;
        }
    }}
`

const CelestialTertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({asChild, ...props}, ref) => {
    if (asChild) {
        return (
            <TertiaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </TertiaryButton>
        );
    }

    return <TertiaryButton ref={ref} {...props} />;
})

CelestialTertiaryButton.displayName = 'TertiaryButton';
export default CelestialTertiaryButton;
