"use client";

import React, { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { EyeIcon, EyeSlashIcon } from '@/components/svg/EyeIcon';
import SingleInput, { InputProps } from '../single/SingleInput';

const Wrapper = styled.div`
    position: relative;
    width: 100%;
`;

const ToggleButton = styled.button`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${(props) => props.theme.colors?.border || '#ccc'};
    display: flex;
    align-items: center;
    padding: 0;

    &:hover {
        color: ${(props) => props.theme.colors?.primary || '#000'};
    }
`;

const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowPassword((prev) => !prev);
    };

    return (
        <Wrapper>
            <SingleInput
                {...props}
                ref={ref}
                type={showPassword ? "text" : "password"}
            />

            <ToggleButton type="button" onClick={toggleVisibility} tabIndex={-1}>
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </ToggleButton>
        </Wrapper>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
