"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`

const StyledLabel = styled.div`
    position: absolute;
    left: 5px;
    transition: all 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    z-index: 1;
    background-color: ${(props) => props.theme.celestial.surface};
    color: ${(props) => props.theme.celestial.textSecondary};
    
    pointer-events: none;
`

const StyledInput = styled.input<InputProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || 'auto')};
    padding: 5px;
    
    font-size: ${(props) => props.theme.fontSizes.body};
    
    border: 1px solid ${(props) => props.theme.celestial.primary};
    outline: none;
    border-radius: 5px;
    transition: box-shadow 0.3s ease;
    
    &:focus + ${StyledLabel}, &:not(:placeholder-shown) + ${StyledLabel} {
        top: 0;
        transform: translateY(-50%);
        font-size: ${(props) => props.theme.fontSizes.label};
        color: ${(props) => props.theme.celestial.text};
    }
    
    &:focus {
        box-shadow: 0 0 10px 3px ${(props) => props.theme.celestial.accent};
    }
`

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    return (
        <InputWrapper>
            <StyledInput {...props} ref={ref} placeholder="" ></StyledInput>
            {props.label && <StyledLabel>{props.label}</StyledLabel>}
        </InputWrapper>
    );
});

Input.displayName = 'Input';

export default Input;