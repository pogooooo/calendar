"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import {
    celestial_singleInput_input,
    celestial_singleInput_label,
    celestial_singleInput_wrapper
} from "@/styles/celestial_theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const CelestialWrapper = styled.div`
    ${celestial_singleInput_wrapper}
`
const CelestialLabel = styled.div`
    ${celestial_singleInput_label}
`
const CelestialInput = styled.input<InputProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || 'auto')};
    ${celestial_singleInput_input}
`

const CelestialSingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const Component = asChild ? Slot : CelestialInput;

    return (
        <CelestialWrapper>
            <CelestialInput
                as={Component}
                ref={ref}
                placeholder=" "
                {...props}
            >
                {asChild ? props.children : null}
            </CelestialInput>
            {label && <CelestialLabel className="input-label">{label}</CelestialLabel>}
        </CelestialWrapper>
    );
});

CelestialSingleInput.displayName = 'CelestialSingleInput';

export default CelestialSingleInput;
