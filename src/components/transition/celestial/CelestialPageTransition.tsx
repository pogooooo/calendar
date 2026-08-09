"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";

let hasNavigated = false;

const CRATERS = [
    { cx: 104, cy: 74, r: 5.5, delay: 0.3 },
    { cx: 92, cy: 100, r: 3.2, delay: 0.38 },
    { cx: 110, cy: 116, r: 4.4, delay: 0.46 },
];

const SPARKS = [
    { x: 26, y: 40, s: 9, delay: 0.34 },
    { x: 166, y: 58, s: 7, delay: 0.44 },
    { x: 150, y: 152, s: 10, delay: 0.52 },
    { x: 36, y: 138, s: 6, delay: 0.6 },
];

export default function CelestialPageTransition({ children }: { children: React.ReactNode }) {
    const animate = hasNavigated;

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <Stage>
            {animate && (
                <Overlay aria-hidden="true">
                    <Veil />
                    <Art viewBox="0 0 192 192">
                        <circle className="ring" cx="96" cy="96" r="74" pathLength={100} />
                        <ellipse className="orbit" cx="96" cy="96" rx="86" ry="34" pathLength={100} />

                        <path
                            className="moon"
                            pathLength={100}
                            d="M118 46 a54 54 0 1 0 0 100 a42 42 0 1 1 0 -100 z"
                        />

                        {CRATERS.map((c, i) => (
                            <circle
                                key={i}
                                className="crater"
                                cx={c.cx}
                                cy={c.cy}
                                r={c.r}
                                style={{ animationDelay: `${c.delay}s` }}
                            />
                        ))}

                        {SPARKS.map((s, i) => (
                            <text
                                key={i}
                                className="spark"
                                x={s.x}
                                y={s.y}
                                fontSize={s.s}
                                textAnchor="middle"
                                style={{ animationDelay: `${s.delay}s` }}
                            >
                                ✦
                            </text>
                        ))}
                    </Art>
                </Overlay>
            )}
            <Body $animate={animate}>{children}</Body>
        </Stage>
    );
}

const strokeCycle = keyframes`
    0%   { stroke-dashoffset: 100; opacity: 0; }
    12%  { opacity: 1; }
    48%  { stroke-dashoffset: 0; }
    60%  { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: -100; opacity: 0; }
`;

const dotCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.4); }
    45%  { opacity: 0.9; transform: scale(1); }
    70%  { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.4); }
`;

const sparkCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.3) rotate(-25deg); }
    45%  { opacity: 1; transform: scale(1) rotate(0deg); }
    70%  { opacity: 1; }
    100% { opacity: 0; transform: scale(0.5) rotate(25deg); }
`;

const artCycle = keyframes`
    0%   { transform: scale(0.94); }
    55%  { transform: scale(1); }
    100% { transform: scale(1.05); }
`;

const veilCycle = keyframes`
    0%   { opacity: 0; }
    30%  { opacity: 1; }
    100% { opacity: 0; }
`;

const bodyIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const Stage = styled.div`
    position: relative;
    height: 100%;
`;

const Body = styled.div<{ $animate: boolean }>`
    height: 100%;

    ${p => p.$animate && css`
        @media (prefers-reduced-motion: no-preference) {
            animation: ${bodyIn} 0.6s ease-out 0.45s both;
        }
    `}
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;

    @media (prefers-reduced-motion: reduce) {
        display: none;
    }
`;

const Veil = styled.span`
    position: absolute;
    inset: 0;
    background-color: ${p => p.theme.colors.background};
    animation: ${veilCycle} 1.15s ease-in-out both;
`;

const Art = styled.svg`
    position: relative;
    width: 240px;
    height: 240px;
    overflow: visible;
    color: ${p => p.theme.colors.primary};
    animation: ${artCycle} 1.15s cubic-bezier(0.33, 0, 0.2, 1) both;

    .ring,
    .orbit,
    .moon {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 100;
        animation: ${strokeCycle} 1.15s cubic-bezier(0.4, 0, 0.3, 1) both;
    }

    .moon {
        stroke-width: 1.6;
    }

    .ring {
        stroke-width: 0.8;
        opacity: 0.55;
        animation-delay: 0.08s;
    }

    .orbit {
        stroke-width: 0.7;
        opacity: 0.4;
        animation-delay: 0.16s;
    }

    .crater {
        fill: none;
        stroke: currentColor;
        stroke-width: 0.9;
        opacity: 0;
        transform-origin: center;
        transform-box: fill-box;
        animation: ${dotCycle} 0.8s ease-out both;
    }

    .spark {
        fill: currentColor;
        opacity: 0;
        transform-origin: center;
        transform-box: fill-box;
        animation: ${sparkCycle} 0.75s ease-out both;
    }
`;
