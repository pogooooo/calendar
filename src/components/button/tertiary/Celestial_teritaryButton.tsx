"use client";

import * as React from 'react';
import { Slot } from "@radix-ui/react-slot";
import * as S from "./Celestial_teritaryButton.styles";
import type { ButtonProps } from "./Celestial_teritaryButton.styles";

export type { ButtonProps } from "./Celestial_teritaryButton.styles";

const CelestialTertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    if (asChild) {
        return (
            <S.TertiaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </S.TertiaryButton>
        );
    }

    return <S.TertiaryButton ref={ref} {...props} />;
})

CelestialTertiaryButton.displayName = 'TertiaryButton';
export default CelestialTertiaryButton;
