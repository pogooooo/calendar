"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import {
    celestial_defaultInput_input,
    celestial_defaultInput_label,
    celestial_defaultInput_wrapper
} from "@/styles/celestial_theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const CelestialWrapper = styled.div`
    ${celestial_defaultInput_wrapper}
`
const CelestialLabel = styled.div`
    ${celestial_defaultInput_label}
`
const CelestialInput = styled.input<InputProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || 'auto')};
    ${celestial_defaultInput_input}
`

const CelestialSingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    if (asChild) {
        return (
            <CelestialWrapper>
                <CelestialInput as={Slot} ref={ref} {...props}>
                    {props.children}
                </CelestialInput>
                {label && <CelestialLabel className="input-label">{label}</CelestialLabel>}
            </CelestialWrapper>
        );
    }
    return (
        <CelestialWrapper>
            <CelestialInput ref={ref} {...props} placeholder=" " />
            {label && <CelestialLabel className="input-label">{label}</CelestialLabel>}
        </CelestialWrapper>
    );
});

CelestialSingleInput.displayName = 'CelestialSingleInput';

export default CelestialSingleInput;
