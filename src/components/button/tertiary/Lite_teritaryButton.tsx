"use client";

import * as React from 'react';
import styled from 'styled-components';
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $label?: string;
}

const TertiaryButton = styled.button`
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    font-weight: 500;
    font-family: ${(props) => props.theme.fonts.body};
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    padding: 0;
    position: relative;

    &::before {
        content: "";
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50% 50% 50% 0;
        background: ${(props) => props.theme.colors.primary}80;
        transform: rotate(-45deg);
        margin-right: 5px;
        vertical-align: middle;
    }

    &:hover {
        text-decoration: underline;
        opacity: 0.8;
    }
`;

const LiteTertiaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, ...props }, ref) => {
    if (asChild) {
        return (
            <TertiaryButton as={Slot} ref={ref} {...props}>
                {props.children}
            </TertiaryButton>
        );
    }

    return <TertiaryButton ref={ref} {...props} />;
});

LiteTertiaryButton.displayName = 'LiteTertiaryButton';
export default LiteTertiaryButton;
