"use client";

import * as GemS from "./gem/TertiaryButton.styles";
import * as React from 'react';
import { Slot } from "@radix-ui/react-slot";
import type { ButtonProps } from "./celestial/TertiaryButton.styles";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/TertiaryButton.styles";
import * as MapleS from "./maple/TertiaryButton.styles";
import * as OceanS from './ocean/TertiaryButton.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export type { ButtonProps } from "./celestial/TertiaryButton.styles";

const TertiaryButtonView = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    const S = usePickTheme(STYLES);
    if (asChild) {
        return (
            <S.TertiaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </S.TertiaryButton>
        );
    }

    return <S.TertiaryButton ref={ref} {...props} />;
})

TertiaryButtonView.displayName = 'TertiaryButton';
export default TertiaryButtonView;
