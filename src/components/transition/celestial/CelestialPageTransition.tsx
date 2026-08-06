"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";

let hasNavigated = false;

export default function CelestialPageTransition({ children }: { children: React.ReactNode }) {
    const animate = hasNavigated;

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <Stage>
            {animate && (
                <Overlay aria-hidden="true">
                    <span className="flight main">
                        <span className="trail" />
                        <span className="head">✦</span>
                    </span>
                    <span className="flight echo">
                        <span className="trail" />
                        <span className="head">✦</span>
                    </span>
                    <span className="pop p1">✦</span>
                    <span className="pop p2">✦</span>
                    <span className="pop p3">✦</span>
                </Overlay>
            )}
            <Body $animate={animate}>{children}</Body>
        </Stage>
    );
}

const fly = keyframes`
    0%   { transform: translateX(-14vw); opacity: 0; }
    10%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateX(92vw); opacity: 0; }
`;

const headSpin = keyframes`
    from { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.25); }
    to   { transform: rotate(360deg) scale(1); }
`;

const popIn = keyframes`
    0%   { opacity: 0; transform: scale(0) rotate(0deg); }
    45%  { opacity: 1; transform: scale(1.1) rotate(40deg); }
    100% { opacity: 0; transform: scale(0.4) rotate(80deg); }
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

    .flight {
        position: absolute;
        left: 0;
        display: flex;
        align-items: center;
        animation: ${fly} 0.6s cubic-bezier(0.3, 0, 0.4, 1) both;
    }

    .flight.main { top: 16%; }

    .flight.echo {
        top: 58%;
        animation-delay: 0.09s;
        animation-duration: 0.66s;

        .trail { width: 12vw; opacity: 0.5; }
        .head { font-size: 9px; opacity: 0.6; }
    }

    .trail {
        width: 24vw;
        height: 1px;
        background: linear-gradient(to left, ${p => p.theme.colors.primary}, transparent);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}44;
    }

    .head {
        margin-left: 2px;
        font-size: 13px;
        line-height: 1;
        color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 8px ${p => p.theme.colors.primary};
        animation: ${headSpin} 0.6s linear both;
    }

    .pop {
        position: absolute;
        font-size: 10px;
        line-height: 1;
        color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 6px ${p => p.theme.colors.primary}99;
        animation: ${popIn} 0.55s ease-out both;
    }

    .pop.p1 { top: 24%; left: 30%; animation-delay: 0.12s; }
    .pop.p2 { top: 40%; left: 68%; animation-delay: 0.22s; font-size: 13px; }
    .pop.p3 { top: 66%; left: 44%; animation-delay: 0.3s; font-size: 8px; }
`;
