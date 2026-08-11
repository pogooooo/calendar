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
    $numeral?: string;
    $active?: boolean;
    $isDropdown?: boolean;
    $isOpen?: boolean;
    $onArrowClick?: (e: React.MouseEvent) => void;
}

const Numeral = styled.em`
    margin-left: auto;
    margin-right: 12px;
    flex-shrink: 0;
    font-style: normal;
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: 0.5;
    transition: opacity 0.25s ease, color 0.25s ease;
`;

const IconContainer = styled.div`
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 5px;
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
        background-color: ${(props) => props.theme.colors.textSecondary}55;
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

    &:hover ${Numeral} {
        opacity: 1;
        color: ${(props) => props.theme.colors.primary};
    }

    ${({ $active, theme }) => $active && css`
        background-size: calc(100% - 32px) 1px;

        &::before,
        &::after {
            transform: scale(1) rotate(0deg);
        }

        ${Numeral} {
            opacity: 1;
            color: ${theme.colors.primary};
        }
    `}
`;

const CelestialSidebarMenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {

    const Component = asChild ? Slot : 'button';

    const IconSection = (
        <IconContainer>
            <MainIcon>
                {props.children}
            </MainIcon>

            {props.$isDropdown && (
                <ArrowIconWrapper
                    $isOpen={props.$isOpen}
                    onClick={props.$onArrowClick}
                >
                    <ChevronRight size={16} />
                </ArrowIconWrapper>
            )}
        </IconContainer>
    );

    return (
        <SidebarButton as={Component} ref={ref} {...props} >
            {IconSection}
            <span>{props.label}</span>
            {props.$numeral && <Numeral>{props.$numeral}</Numeral>}
        </SidebarButton>
    );
});

CelestialSidebarMenuButton.displayName = 'Celestial_SidebarMenu_Button';

export default CelestialSidebarMenuButton;
