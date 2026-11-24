"use client";

import { ControlSeal } from "@/components/ornament/celestial/ControlOrnaments";
import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import type { ButtonProps } from "./celestial/SecondaryButton.styles";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/SecondaryButton.styles";
import * as MapleS from "./maple/SecondaryButton.styles";
import * as OceanS from './ocean/SecondaryButton.styles';
import styled, { css } from "styled-components";
import { gemButton, gemQuietButton } from "@/features/gem/GemLive.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const GemSecondaryButton = styled(CelestialS.SecondaryButton)`
    ${({ $variant }) => $variant === "primary" ? gemButton : gemQuietButton}
    ${({ $variant }) => $variant === "danger" && css`
        color: ${({ theme }) => theme.colors.error};
        border-color: currentColor;
        &:hover:not(:disabled) { color: ${({ theme }) => theme.colors.error}; border-color: currentColor; }
    `}
    min-width: min(100%, 44px);
    padding-inline: 8px;
    font-size: .9rem;
    &::after { content: none; }
`;
const STYLES: ThemeImpls<typeof CelestialS> = {
    celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: { SecondaryButton: GemSecondaryButton },
};

export type { ButtonProps } from "./celestial/SecondaryButton.styles";


const SecondaryButtonView = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild, $variant, ...props }, ref) => {
    const S = usePickTheme(STYLES);
    const celestial = S === CelestialS;
    const variant = $variant ?? (celestial && props.type === "submit" ? "primary" : "default");
    if (asChild) {
        return (
            <S.SecondaryButton as={Slot} ref={ref} $variant={celestial ? variant : undefined} {...props}>
                {props.children}
            </S.SecondaryButton>
        );
    }

    if (celestial && variant === 'primary' && props.children) {
        const hasIcon = React.Children.toArray(props.children).some(React.isValidElement);
        return <S.SecondaryButton ref={ref} $variant={variant} {...props}>
            {!hasIcon && <ControlSeal kind="sun" size={20} />}
            {props.children}
            <ControlSeal kind="star" size={7} />
        </S.SecondaryButton>;
    }

    return <S.SecondaryButton ref={ref} $variant={variant} {...props} />;
});

SecondaryButtonView.displayName = 'CelestialSecondaryInput';

export default SecondaryButtonView;
