"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface ButtonProps extends InputHTMLAttributes<HTMLInputElement> {
    $width?: string | number;
    $height?: string | number;
    label?: string;
    onClick: () => void;
}

const ButtonWrapper = styled.button<ButtonProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px 0 10px;
    width: 300px;
    height: 40px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 5px;

    &:hover {
        border: 1px solid ${(props) => props.theme.colors.accent};
        cursor: pointer;
        box-shadow: 0 0 5px 1px ${(props) => props.theme.colors.accent};
    }
`

const DefaultButton = forwardRef<HTMLInputElement, ButtonProps>((props, ref) => {
    return (
        <ButtonWrapper onClick={props.onClick}>
            {props.label}
        </ButtonWrapper>
    );
});

DefaultButton.displayName = 'DefaultButton';

export default DefaultButton;
