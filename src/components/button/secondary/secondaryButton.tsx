"use client";

import * as React from 'react';
import {useTheme} from 'styled-components';
import CelestialSecondaryButton, { ButtonProps } from "./celestial_secondaryButton";

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName === 'celestial') {
        return <CelestialSecondaryButton ref={ref} {...props} />;
    }
});

SecondaryButton.displayName = 'Button';

export default SecondaryButton;
