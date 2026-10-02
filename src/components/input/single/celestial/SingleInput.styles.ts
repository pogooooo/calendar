/**
 * Celestial_SingleInput 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import type { InputHTMLAttributes } from "react";
import {
    celestial_singleInput_input,
    celestial_singleInput_label,
    celestial_singleInput_wrapper,
} from "@/styles/celestial_theme";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    asChild?: boolean;
    $width?: string | number;
    $height?: string | number;
    label?: string;
}

export const CelestialWrapper = styled.div`
    ${celestial_singleInput_wrapper}
`;

export const CelestialLabel = styled.label`
    ${celestial_singleInput_label}
`;

export const CelestialInput = styled.input<InputProps>`
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width || '100%')};
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || 'auto')};
    ${celestial_singleInput_input}
`;
