"use client";

import * as React from 'react';
import styled from 'styled-components';
import {Slot} from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $label?: string;
}

const TertiaryButton = styled.button`
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
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
