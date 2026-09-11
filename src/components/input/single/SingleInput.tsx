"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { usePickTheme } from "@/styles/themed";

import CelestialSingleInput from './Celestial_SingleInput';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const SingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const SingleInputView = usePickTheme({ celestial: CelestialSingleInput });

    return <SingleInputView ref={ref} asChild={asChild} label={label} {...props} />;
});

SingleInput.displayName = 'Input';

export default SingleInput;
