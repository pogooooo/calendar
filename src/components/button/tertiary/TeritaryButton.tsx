"use client";

import * as React from 'react';
import {useTheme} from 'styled-components';
import CelestialTertiaryButton , { ButtonProps } from "./Celestial_teritaryButton";
import LiteTertiaryButton from "./Lite_teritaryButton";

const TertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName.startsWith('celestial')) {
        return <CelestialTertiaryButton asChild={asChild} ref={ref} {...props} />;
    }
    if (themeName === 'botanical') {
        return <LiteTertiaryButton asChild={asChild} ref={ref} {...props} />;
    }
});

TertiaryButton.displayName = 'TerButton';

export default TertiaryButton;
