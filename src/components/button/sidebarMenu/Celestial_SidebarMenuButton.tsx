"use client";

import React from 'react';
import styled, {css} from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import { celestial_sidebar_menuButton } from "@/styles/celestial_theme"
import { ChevronRight } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
    $isDropdown?: boolean;
    $isOpen?: boolean;
    $onArrowClick?: (e: React.MouseEvent) => void;
}

const IconContainer = styled.div`
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const MainIcon = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease, transform 0.2s ease;
    
    opacity: 1;
    transform: scale(1);
`;

const ArrowIconWrapper = styled.div<{ $isOpen?: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    opacity: 0;
    transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")}) scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease;
    
    color: inherit;
    border-radius: 50%;
    cursor: pointer;
    
    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
`;

const SidebarButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    display: flex;
    align-items: center;
    gap: 8px;
    
    ${({ theme }) => {
        switch (theme.name) {
            case 'celestial': return celestial_sidebar_menuButton
            default: return celestial_sidebar_menuButton;
        }
    }}

    ${({ $isDropdown, $isOpen }) => $isDropdown && css`
        &:hover ${MainIcon} {
            opacity: 0;
            transform: scale(0.8);
        }
        &:hover ${ArrowIconWrapper} {
            opacity: 1;
            transform: rotate(${$isOpen ? "90deg" : "0deg"}) scale(1);
        }
    `}
`;

const CelestialSidebarMenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    const handleArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (props.$onArrowClick) {
            props.$onArrowClick(e);
        }
    };

    const IconSection = (
        <IconContainer>
            <MainIcon>
                {props.children}
            </MainIcon>

            {props.$isDropdown && (
                <ArrowIconWrapper
                    $isOpen={props.$isOpen}
                    onClick={props.$onArrowClick ? handleArrowClick : undefined}
                >
                    <ChevronRight size={16} />
                </ArrowIconWrapper>
            )}
        </IconContainer>
    );

    if (asChild) {
        return (
            <SidebarButton as={Slot} ref={ref} {...props}>
                {IconSection}
                <span>{props.label}</span>
            </SidebarButton>
        );
    }

    return (
        <SidebarButton ref={ref} {...props} >
            {IconSection}
            <span>{props.label}</span>
        </SidebarButton>
    );
});

CelestialSidebarMenuButton.displayName = 'Celestial_SidebarMenu_Button';

export default CelestialSidebarMenuButton;
