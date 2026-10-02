"use client";

import * as React from "react";
import * as S from "./MaplePageTransition.styles";
import useThemeMotion from '@/hooks/useThemeMotion';

let hasNavigated = false;

/** 잎마다 자리·기울기·지연. 매번 같아야 화면이 바뀔 때마다 다른 자리로 튀지 않는다 */
const LEAVES = [
    { sprite: 1, x: 18, dx: 40, r0: -20, r1: 160, delay: 0 },
    { sprite: 4, x: 36, dx: -30, r0: 30, r1: -120, delay: 0.06 },
    { sprite: 6, x: 55, dx: 25, r0: -60, r1: 90, delay: 0.12 },
    { sprite: 2, x: 70, dx: -45, r0: 10, r1: 200, delay: 0.03 },
    { sprite: 7, x: 84, dx: 20, r0: 45, r1: -80, delay: 0.09 },
];

export default function MaplePageTransition({ children }: { children: React.ReactNode }) {
    const motion = useThemeMotion();
    const animate = hasNavigated && motion !== 'off';

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <S.Stage>
            {animate && (
                <S.Overlay aria-hidden="true" data-page-transition-overlay>
                    <S.Veil />
                    <S.Rule />
                    {LEAVES.map((l) => (
                        <S.Leaf
                            key={l.sprite}
                            src={`/themes/maple/leaves/leaf-${l.sprite}.webp`}
                            alt=""
                            draggable={false}
                            style={{
                                left: `${l.x}%`,
                                animationDelay: `${l.delay}s`,
                                ["--dx" as string]: `${l.dx}px`,
                                ["--r0" as string]: `${l.r0}deg`,
                                ["--r1" as string]: `${l.r1}deg`,
                            } as React.CSSProperties}
                        />
                    ))}
                </S.Overlay>
            )}
            <S.Body $animate={animate}>{children}</S.Body>
        </S.Stage>
    );
}
