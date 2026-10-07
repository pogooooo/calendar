/**
 * Celestial_SidebarMenuButton 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { css } from "styled-components";
import { celestial_sidebar_menuButton } from "@/styles/celestial_theme"
import type * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
    $numeral?: string;
    $active?: boolean;
    $isDropdown?: boolean;
    $isOpen?: boolean;
    $onArrowClick?: (e: React.MouseEvent) => void;
}

export const Numeral = styled.em`
    margin-left: auto;
    margin-right: 12px;
    flex-shrink: 0;
    font-style: normal;
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: 0.5;
    transition: opacity 0.25s ease, color 0.25s ease;
`;

export const IconContainer = styled.div`
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 5px;
`;

export const MainIcon = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease, transform 0.2s ease;
    
    opacity: 1;
    transform: scale(1);
`;

export const ArrowIconWrapper = styled.div<{ $isOpen?: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    opacity: 0;
    transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")}) scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease;
    
    color: inherit;
    border-radius: 50%;
    cursor: pointer;
    
    &:hover {
        background-color: ${(props) => props.theme.colors.textSecondary}55;
    }
`;

export const SidebarButton = styled.button<ButtonProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '40px')};

    display: flex;
    align-items: center;
    gap: 8px;

    ${celestial_sidebar_menuButton}

    /* 26px·굵기 2 의 선 아이콘은 가는 금빛 선들 사이에서 혼자 무거웠다 — 한 단 작고 가늘게 */
    svg { width: 21px; height: 21px; stroke-width: 1.6; }

    ${({ $isDropdown, $isOpen }) => $isDropdown && css`
        &:hover ${MainIcon} {
            opacity: 0;
            transform: scale(0.8);
        }
        &:hover ${ArrowIconWrapper} {
            opacity: 1;
            transform: rotate(${$isOpen ? "90deg" : "0deg"}) scale(1);
        }
    `}

    &:hover ${Numeral} {
        opacity: 1;
        color: ${(props) => props.theme.colors.primary};
    }

    ${({ $active, theme }) => $active && css`
        background-size: calc(100% - 32px) 1px;

        &::before,
        &::after {
            transform: scale(1) rotate(0deg);
        }

        ${Numeral} {
            opacity: 1;
            color: ${theme.colors.primary};
        }
    `}
`;
