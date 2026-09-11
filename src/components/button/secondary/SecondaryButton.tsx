"use client";

import * as React from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialSecondaryButton, { ButtonProps } from "./Celestial_SecondaryButton";

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const SecondaryButtonView = usePickTheme({ celestial: CelestialSecondaryButton });

    return <SecondaryButtonView ref={ref} {...props} />;
});

SecondaryButton.displayName = 'SecButton';

export default SecondaryButton;
