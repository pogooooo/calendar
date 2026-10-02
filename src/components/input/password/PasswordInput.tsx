"use client";

import React, { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { EyeIcon, EyeSlashIcon } from '@/assets/icons/EyeIcon';
import SingleInput, { InputProps } from '../single/SingleInput';
import { useT } from '@/i18n/useT';

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
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    padding: 8px;

    &:hover {
        color: ${(props) => props.theme.colors?.primary || '#000'};
    }
`;

const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const t = useT();

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
                style={{ ...props.style, paddingRight: '58px' }}
            />

            <ToggleButton type="button" onClick={toggleVisibility} aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword} aria-pressed={showPassword}>
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </ToggleButton>
        </Wrapper>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
