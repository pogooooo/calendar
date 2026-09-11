"use client";

import * as React from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialTertiaryButton , { ButtonProps } from "./Celestial_teritaryButton";

const TertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    const TertiaryButtonView = usePickTheme({ celestial: CelestialTertiaryButton });

    return <TertiaryButtonView asChild={asChild} ref={ref} {...props} />;
});

TertiaryButton.displayName = 'TerButton';

export default TertiaryButton;
