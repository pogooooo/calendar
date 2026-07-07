"use client";

import * as React from 'react';
import {useTheme} from 'styled-components';
import CelestialSidebarMenuButton, { ButtonProps } from "./Celestial_SidebarMenuButton";
import LiteSidebarMenuButton from "./Lite_SidebarMenuButton";

const Sidebar_MenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

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

    if (themeName.startsWith('celestial')) {
        return <CelestialSidebarMenuButton ref={ref} {...props} />;
    }
    if (themeName === 'botanical') {
        return <LiteSidebarMenuButton ref={ref} {...props} />;
    }
});

Sidebar_MenuButton.displayName = 'Sidebar_MenuButton';

export default Sidebar_MenuButton;
