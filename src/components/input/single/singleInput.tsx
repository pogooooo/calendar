"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { useTheme } from 'styled-components';
import { Slot } from "@radix-ui/react-slot";
import CelestialSingleInput from './celestial_singleInput';

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

    if (themeName === 'celestial') {
        return <CelestialSingleInput ref={ref} asChild={asChild} label={label} {...props} />;
    }

    const Comp = asChild ? Slot : 'input';

    return (
        <ThemeAWrapper>
            <div className="top-deco">Theme A 상단 장식</div>

            <Comp ref={ref} {...props} style={{ padding: '8px', border: '1px solid #ccc' }}>
                {asChild ? props.children : null}
            </Comp>

            <div className="bottom-footer">
                {label && <span>라벨: {label}</span>}
            </div>
        </ThemeAWrapper>
    );
});

SingleInput.displayName = 'Input';

export default SingleInput;
