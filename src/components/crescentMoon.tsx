"use client";

import React from 'react';
import styled from 'styled-components';

const MoonContainer = styled.svg<MoonProps>`
    height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '100vh')};
`;

const MoonPath = styled.path`
    stroke: ${(props) => props.theme.celestial.primary};
    stroke-width: 0.1px;
`;

interface MoonProps extends React.SVGProps<SVGSVGElement> {
    $height?: string | number;
}

const CrescentMoon: React.FC<MoonProps> = ({$height, ...props}) => {
    return (
        <MoonContainer viewBox="0 0 100 100" $height={$height} {...props}>
            <MoonPath
                d="M85 25 A45 45 0 1 0 85 75 A35 35 0 1 1 85 25z"
                fill="none"
            />
        </MoonContainer>
    );
};

export default CrescentMoon;