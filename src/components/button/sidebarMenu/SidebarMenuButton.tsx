"use client";

import * as React from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialSidebarMenuButton, { ButtonProps } from "./Celestial_SidebarMenuButton";

const Sidebar_MenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const SidebarMenuButtonView = usePickTheme({ celestial: CelestialSidebarMenuButton });

    const handleArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (props.$onArrowClick) {
            props.$onArrowClick(e);
        }
    };

    const extendedProps = {
        ...props,
        $onArrowClick: props.$onArrowClick ? handleArrowClick : undefined
    };

    return <SidebarMenuButtonView ref={ref} {...props} />;
});

Sidebar_MenuButton.displayName = 'Sidebar_MenuButton';

export default Sidebar_MenuButton;
