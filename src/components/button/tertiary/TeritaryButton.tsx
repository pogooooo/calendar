"use client";

import * as React from 'react';
import TertiaryButtonView , { ButtonProps } from "./TertiaryButtonView";

const TertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, ...props }, ref) => {
    return <TertiaryButtonView asChild={asChild} ref={ref} {...props} />;
});

TertiaryButton.displayName = 'TerButton';

export default TertiaryButton;
