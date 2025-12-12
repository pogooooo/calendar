"use client";

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import styled, { css } from 'styled-components';
import { celestialButtonStyles, lightButtonStyles } from './styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
  height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

  ${({ theme }) => {
    switch (theme.name) {
        case 'light':
            return lightButtonStyles;
        case 'celestial':
        default:
            return celestialButtonStyles;
    }
}}
`;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : StyledButton;

        if (asChild) {
            return (
                <StyledButton as={Slot} ref={ref} {...props}>
                    {props.children}
                </StyledButton>
            );
        }

        return <StyledButton ref={ref} {...props} />;
    }
);

Button.displayName = 'Button';

export default Button;
