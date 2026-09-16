/**
 * Celestial_teritaryButton 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import type * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    $label?: string;
}

export const TertiaryButton = styled.button`
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`;
