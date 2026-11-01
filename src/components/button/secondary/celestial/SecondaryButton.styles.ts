/**
 * Celestial_SecondaryButton 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { css } from "styled-components";
import type * as React from "react";
import { gilt } from "@/styles/celestial/almanac";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    $variant?: 'default' | 'danger' | 'primary';
}

export const SecondaryButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    background-color: transparent;
    cursor: pointer;
    
    display: flex;
    align-items: center;
    justify-content: center;

    ${(props) => {
        if (props.$variant === 'danger') {
            return css`
                border: 1px solid ${(props) => props.theme.colors.error};
                color: ${(props) => props.theme.colors.error};
                
                &:hover {
                    border-color: ${(props) => props.theme.colors.error};
                    box-shadow: 0 0 5px ${(props) => props.theme.colors.error};
                }
            `;
        }
        if (props.$variant === 'primary') {
            // 단색 금색과 짙은 먹으로 주요 행동을 구분한다.
            return css`
                ${gilt}
                border: 1px solid ${(props) => props.theme.colors.primary};
                
                &:hover {
                    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}33;
                }
            `;
        }
        return css`
            border: 1px solid ${props.theme.colors.border};
            color: ${props.theme.colors.text};

            &:hover {
                border-color: ${props.theme.colors.primary};
                box-shadow: 0 0 6px ${props.theme.colors.primary}66;
            }
        `;
    }}

    &:active {
        transform: scale(0.96);
    }
`;
