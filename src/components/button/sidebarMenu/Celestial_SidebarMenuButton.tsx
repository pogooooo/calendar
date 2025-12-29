"use client";

import React from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import { celestial_sidebar_menuButton } from "@/styles/celestial_theme"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const SidebarButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    ${({ theme }) => {
        switch (theme.name) {
            case 'celestial': return celestial_sidebar_menuButton
            default: return celestial_sidebar_menuButton;
        }
    }}
`;

const CelestialSidebarMenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    if (asChild) {
        return (
            <SidebarButton as={Slot} ref={ref} {...props}>
                <span>{props.label}</span>
                {props.children}
            </SidebarButton>
        );
    }

    return (
        <SidebarButton ref={ref} {...props} >
            {props.children}
            <span>{props.label}</span>
        </SidebarButton>
    );
});

CelestialSidebarMenuButton.displayName = 'Celestial_SidebarMenu_Button';

export default CelestialSidebarMenuButton;
