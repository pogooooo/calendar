"use client";

import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import * as S from "./Celestial_SecondaryButton.styles";
import type { ButtonProps } from "./Celestial_SecondaryButton.styles";

export type { ButtonProps } from "./Celestial_SecondaryButton.styles";


const CelestialSecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, $variant = 'default', ...props }, ref) => {
    if (asChild) {
        return (
            <S.SecondaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </S.SecondaryButton>
        );
    }

    return <S.SecondaryButton ref={ref} $variant={$variant} {...props} />;
});

CelestialSecondaryButton.displayName = 'CelestialSecondaryInput';

export default CelestialSecondaryButton;
