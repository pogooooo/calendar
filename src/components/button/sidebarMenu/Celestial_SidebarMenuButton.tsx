"use client";

import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import * as S from "./Celestial_SidebarMenuButton.styles";
import type { ButtonProps } from "./Celestial_SidebarMenuButton.styles";

export type { ButtonProps } from "./Celestial_SidebarMenuButton.styles";


const CelestialSidebarMenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {

    const Component = asChild ? Slot : 'button';

    const IconSection = (
        <S.IconContainer>
            <S.MainIcon>
                {props.children}
            </S.MainIcon>

            {props.$isDropdown && (
                <S.ArrowIconWrapper
                    $isOpen={props.$isOpen}
                    onClick={props.$onArrowClick}
                >
                    <ChevronRight size={16} />
                </S.ArrowIconWrapper>
            )}
        </S.IconContainer>
    );

    return (
        <S.SidebarButton as={Component} ref={ref} {...props} >
            {IconSection}
            <span>{props.label}</span>
            {props.$numeral && <S.Numeral>{props.$numeral}</S.Numeral>}
        </S.SidebarButton>
    );
});

CelestialSidebarMenuButton.displayName = 'Celestial_SidebarMenu_Button';

export default CelestialSidebarMenuButton;
