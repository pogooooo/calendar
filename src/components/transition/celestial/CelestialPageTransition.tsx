"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";

let hasNavigated = false;

const FLIGHTS = [
    { top: "14%", delay: 0, duration: 0.62, trail: "24vw", size: 13, tilt: 3, dim: 1 },
    { top: "34%", delay: 0.07, duration: 0.7, trail: "15vw", size: 9, tilt: -2, dim: 0.65 },
    { top: "56%", delay: 0.12, duration: 0.66, trail: "19vw", size: 11, tilt: 2, dim: 0.8 },
    { top: "76%", delay: 0.05, duration: 0.74, trail: "11vw", size: 8, tilt: -3, dim: 0.5 },
];

const POPS = [
    { top: "22%", left: "28%", delay: 0.14, size: 10 },
    { top: "38%", left: "66%", delay: 0.24, size: 13 },
    { top: "58%", left: "40%", delay: 0.3, size: 8 },
    { top: "70%", left: "72%", delay: 0.2, size: 9 },
    { top: "30%", left: "84%", delay: 0.34, size: 7 },
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
                    <span className="pulse" />

                    {FLIGHTS.map((f, i) => (
                        <span
                            key={i}
                            className="flight"
                            style={{
                                top: f.top,
                                opacity: f.dim,
                                animationDelay: `${f.delay}s`,
                                animationDuration: `${f.duration}s`,
                                transform: `rotate(${f.tilt}deg)`,
                            }}
                        >
                            <span className="trail" style={{ width: f.trail }} />
                            <span className="head" style={{ fontSize: f.size }}>✦</span>
                        </span>
                    ))}

                    <svg className="constellation" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M28 24 L66 39 L40 58 L72 71" />
                    </svg>

                    {POPS.map((p, i) => (
                        <span
                            key={i}
                            className="pop"
                            style={{ top: p.top, left: p.left, fontSize: p.size, animationDelay: `${p.delay}s` }}
                        >
                            ✦
                        </span>
                    ))}
                </Overlay>
            )}
            <Body $animate={animate}>{children}</Body>
        </Stage>
    );
}

const fly = keyframes`
    0%   { translate: -16vw 0; opacity: 0; }
    10%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { translate: 94vw 0; opacity: 0; }
`;

const headSpin = keyframes`
    from { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.3); }
    to   { transform: rotate(360deg) scale(1); }
`;

const popIn = keyframes`
    0%   { opacity: 0; transform: scale(0) rotate(0deg); }
    45%  { opacity: 1; transform: scale(1.15) rotate(40deg); }
    100% { opacity: 0; transform: scale(0.4) rotate(80deg); }
`;

const lineDraw = keyframes`
    0%   { stroke-dashoffset: 240; opacity: 0; }
    15%  { opacity: 0.55; }
    70%  { opacity: 0.55; }
    100% { stroke-dashoffset: 0; opacity: 0; }
`;

const glowPulse = keyframes`
    0%   { opacity: 0; }
    35%  { opacity: 0.5; }
    100% { opacity: 0; }
`;

const bodyIn = keyframes`
    from { opacity: 0; transform: translateY(13px); }
    to   { opacity: 1; transform: none; }
`;

const Stage = styled.div`
    position: relative;
    height: 100%;
`;

const Body = styled.div<{ $animate: boolean }>`
    height: 100%;

    ${p => p.$animate && css`
        @media (prefers-reduced-motion: no-preference) {
            animation: ${bodyIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
        }
    `}
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    overflow: hidden;

    @media (prefers-reduced-motion: reduce) {
        display: none;
    }

    .pulse {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 30% 40%, ${p => p.theme.colors.primary}14, transparent 60%);
        animation: ${glowPulse} 0.7s ease-out both;
    }

    .flight {
        position: absolute;
        left: 0;
        display: flex;
        align-items: center;
        animation-name: ${fly};
        animation-timing-function: cubic-bezier(0.3, 0, 0.4, 1);
        animation-fill-mode: both;
    }

    .trail {
        height: 1px;
        background: linear-gradient(to left, ${p => p.theme.colors.primary}, transparent);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}44;
    }

    .head {
        margin-left: 2px;
        line-height: 1;
        color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 8px ${p => p.theme.colors.primary};
        animation: ${headSpin} 0.65s linear both;
    }

    .constellation {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;

        path {
            fill: none;
            stroke: ${p => p.theme.colors.primary};
            stroke-width: 1;
            vector-effect: non-scaling-stroke;
            stroke-dasharray: 240;
            animation: ${lineDraw} 0.75s ease-out 0.1s both;
        }
    }

    .pop {
        position: absolute;
        line-height: 1;
        color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 6px ${p => p.theme.colors.primary}99;
        animation: ${popIn} 0.55s ease-out both;
    }
`;
