"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const LiteWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const LiteLabel = styled.div`
    position: absolute;
    left: 10px;
    transition: all 0.2s ease;
    font-size: ${(props) => props.theme.fontSizes.body};
    font-family: ${(props) => props.theme.fonts.body};
    z-index: 1;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 0 2px;
    pointer-events: none;
`;

const LiteInput = styled.input<InputProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || 'auto')};
    padding: 8px 10px;
    font-size: ${(props) => props.theme.fontSizes.body};
    font-family: ${(props) => props.theme.fonts.body};
    color: ${(props) => props.theme.colors.text};
    background-color: ${(props) => props.theme.colors.background};

    border: 1px solid ${(props) => props.theme.colors.border};
    outline: none;
    border-radius: 8px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus + .input-label, &:not(:placeholder-shown) + .input-label {
        top: 0;
        transform: translateY(-50%);
        font-size: ${(props) => props.theme.fontSizes.label};
        color: ${(props) => props.theme.colors.primary};
    }

    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}18;
    }

    &::placeholder {
        color: ${(props) => props.theme.colors.textSecondary};
        opacity: 0.5;
    }
`;

const LiteSingleInput = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const Component = asChild ? Slot : LiteInput;

    return (
        <LiteWrapper>
            <LiteInput
                as={Component}
                ref={ref}
                placeholder=" "
                {...props}
            >
                {asChild ? props.children : null}
            </LiteInput>
            {label && <LiteLabel className="input-label">{label}</LiteLabel>}
        </LiteWrapper>
    );
});

LiteSingleInput.displayName = 'LiteSingleInput';

export default LiteSingleInput;
