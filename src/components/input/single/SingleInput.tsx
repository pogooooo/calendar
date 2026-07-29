"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { useTheme } from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import CelestialSingleInput from './Celestial_SingleInput';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const ThemeAWrapper = styled.div`
    border: 2px solid green;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const SingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    return <CelestialSingleInput ref={ref} asChild={asChild} label={label} {...props} />;
});

SingleInput.displayName = 'Input';

export default SingleInput;
