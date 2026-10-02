"use client";

import { forwardRef, useId } from 'react';
import { Slot } from "@radix-ui/react-slot";
import type { InputProps } from "./celestial/SingleInput.styles";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/SingleInput.styles";
import * as MapleS from "./maple/SingleInput.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

export type { InputProps } from "./celestial/SingleInput.styles";

const SingleInputView = forwardRef<HTMLInputElement, InputProps>(({ asChild, label, ...props }, ref) => {
    const S = usePickTheme(STYLES);
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const Component = asChild ? Slot : S.CelestialInput;

    return (
        <S.CelestialWrapper>
            <S.CelestialInput
                as={Component}
                ref={ref}
                placeholder=" "
                {...props}
                id={inputId}
            >
                {asChild ? props.children : null}
            </S.CelestialInput>
            {label && <S.CelestialLabel className="input-label" htmlFor={inputId}>{label}</S.CelestialLabel>}
        </S.CelestialWrapper>
    );
});

SingleInputView.displayName = 'SingleInputView';

export default SingleInputView;
