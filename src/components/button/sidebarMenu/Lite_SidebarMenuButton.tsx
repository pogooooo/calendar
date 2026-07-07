"use client";

import React from 'react';
import styled, { css } from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
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
        background-color: ${(props) => props.theme.colors.textSecondary}33;
    }
`;

const SidebarButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 8px 8px 8px 0;
    cursor: pointer;
    transition: background-color 0.2s ease, border-left-color 0.2s ease;
    font-family: ${(props) => props.theme.fonts.body};
    border: none;
    border-left: 2px solid transparent;
    background: transparent;
    color: ${(props) => props.theme.colors.text};

    & > span {
        margin-left: 5px;
        font-size: 0.9rem;
    }

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
        border-left-color: ${(props) => props.theme.colors.primary}60;
        box-shadow: 2px 2px 6px rgba(217, 207, 199, 0.25);
    }

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

const LiteSidebarMenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {

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
        <SidebarButton as={Component} ref={ref} {...props}>
            {IconSection}
            <span>{props.label}</span>
        </SidebarButton>
    );
});

LiteSidebarMenuButton.displayName = 'Lite_SidebarMenu_Button';

export default LiteSidebarMenuButton;
