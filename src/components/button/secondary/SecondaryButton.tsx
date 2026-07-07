"use client";

import * as React from 'react';
import {useTheme} from 'styled-components';
import CelestialSecondaryButton, { ButtonProps } from "./Celestial_SecondaryButton";
import LiteSecondaryButton from "./Lite_SecondaryButton";

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName.startsWith('celestial')) {
        return <CelestialSecondaryButton ref={ref} {...props} />;
    }
    if (themeName === 'botanical') {
        return <LiteSecondaryButton ref={ref} {...props} />;
    }
});

SecondaryButton.displayName = 'SecButton';

export default SecondaryButton;
