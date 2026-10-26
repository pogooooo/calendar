"use client";

import * as GemS from "./gem/SidebarMenuButton.styles";
import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import type { ButtonProps } from "./celestial/SidebarMenuButton.styles";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/SidebarMenuButton.styles";
import * as MapleS from "./maple/SidebarMenuButton.styles";
import * as OceanS from './ocean/SidebarMenuButton.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export type { ButtonProps } from "./celestial/SidebarMenuButton.styles";


const SidebarMenuButtonView = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    const S = usePickTheme(STYLES);

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

SidebarMenuButtonView.displayName = 'Celestial_SidebarMenu_Button';

export default SidebarMenuButtonView;
