"use client";

import { forwardRef } from 'react';
import { Slot } from "@radix-ui/react-slot";
import * as S from "./Celestial_SingleInput.styles";
import type { InputProps } from "./Celestial_SingleInput.styles";

export type { InputProps } from "./Celestial_SingleInput.styles";

const CelestialSingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const Component = asChild ? Slot : S.CelestialInput;

    return (
        <S.CelestialWrapper>
            <S.CelestialInput
                as={Component}
                ref={ref}
                placeholder=" "
                {...props}
            >
                {asChild ? props.children : null}
            </S.CelestialInput>
            {label && <S.CelestialLabel className="input-label">{label}</S.CelestialLabel>}
        </S.CelestialWrapper>
    );
});

CelestialSingleInput.displayName = 'CelestialSingleInput';

export default CelestialSingleInput;
