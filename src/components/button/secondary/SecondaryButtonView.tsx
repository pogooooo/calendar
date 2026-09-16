"use client";

import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import type { ButtonProps } from "./celestial/SecondaryButton.styles";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/SecondaryButton.styles";
import * as MapleS from "./maple/SecondaryButton.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

export type { ButtonProps } from "./celestial/SecondaryButton.styles";


const SecondaryButtonView = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, $variant = 'default', ...props }, ref) => {
    const S = usePickTheme(STYLES);
    if (asChild) {
        return (
            <S.SecondaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </S.SecondaryButton>
        );
    }

    return <S.SecondaryButton ref={ref} $variant={$variant} {...props} />;
});

SecondaryButtonView.displayName = 'CelestialSecondaryInput';

export default SecondaryButtonView;
