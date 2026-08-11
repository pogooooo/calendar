"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";

let hasNavigated = false;

// 사이드바(CelestialSidebarDesign)의 초승달과 동일한 path
const MOON_PATH = "M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z";

// 화면 전체에 퍼지는 별자리 (퍼센트 좌표)
const NODES = [
    { x: 4, y: 30, s: 11 },
    { x: 15, y: 55, s: 8 },
    { x: 27, y: 23, s: 13 },
    { x: 38, y: 62, s: 9 },
    { x: 52, y: 15, s: 10 },
    { x: 64, y: 71, s: 12 },
    { x: 77, y: 25, s: 8 },
    { x: 89, y: 57, s: 11 },
    { x: 97, y: 33, s: 9 },
];

const POLYLINE = NODES.map(n => `${n.x},${n.y}`).join(" ");

const CRATERS = [
    { cx: 100, cy: 76, r: 4.5, delay: 0.34 },
    { cx: 88, cy: 96, r: 3, delay: 0.42 },
    { cx: 84, cy: 116, r: 4, delay: 0.5 },
];

const RULES = [
    { top: "13%", delay: 0 },
    { top: "87%", delay: 0.08 },
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

                    {RULES.map((r, i) => (
                        <Rule key={i} style={{ top: r.top, animationDelay: `${r.delay}s` }} />
                    ))}

                    <Corners>
                        <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
                    </Corners>

                    <Constellation viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline points={POLYLINE} pathLength={100} />
                    </Constellation>

                    {NODES.map((n, i) => (
                        <Node
                            key={i}
                            style={{
                                left: `${n.x}%`,
                                top: `${n.y}%`,
                                fontSize: n.s,
                                animationDelay: `${0.12 + i * 0.045}s`,
                            }}
                        >
                            ✦
                        </Node>
                    ))}

                    <Art viewBox="0 0 192 192">
                        <circle className="ring" cx="96" cy="96" r="74" pathLength={100} />
                        <ellipse className="orbit" cx="96" cy="96" rx="86" ry="34" pathLength={100} />
                        <path
                            className="moon"
                            pathLength={100}
                            transform="translate(96 96) scale(1.95) translate(-100.389 -232.217)"
                            d={MOON_PATH}
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
                    </Art>
                </Overlay>
            )}
            <Body $animate={animate}>{children}</Body>
        </Stage>
    );
}

const DURATION = "1.25s";

const strokeCycle = keyframes`
    0%   { stroke-dashoffset: 100; opacity: 0; }
    10%  { opacity: 1; }
    48%  { stroke-dashoffset: 0; }
    60%  { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: -100; opacity: 0; }
`;

const ruleCycle = keyframes`
    0%   { transform: scaleX(0); opacity: 0; }
    12%  { opacity: 1; }
    45%  { transform: scaleX(1); }
    62%  { transform: scaleX(1); opacity: 1; }
    100% { transform: scaleX(0); opacity: 0; }
`;

const nodeCycle = keyframes`
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(-30deg); }
    35%  { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    68%  { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(30deg); }
`;

const cornerCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.6); }
    28%  { opacity: 0.9; transform: scale(1); }
    66%  { opacity: 0.9; }
    100% { opacity: 0; transform: scale(1.25); }
`;

const dotCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.4); }
    45%  { opacity: 0.9; transform: scale(1); }
    70%  { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.4); }
`;

const artCycle = keyframes`
    0%   { transform: scale(0.92); }
    55%  { transform: scale(1); }
    100% { transform: scale(1.06); }
`;

const veilCycle = keyframes`
    0%   { opacity: 0; }
    28%  { opacity: 1; }
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
            animation: ${bodyIn} 0.6s ease-out 0.5s both;
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
    color: ${p => p.theme.colors.primary};

    @media (prefers-reduced-motion: reduce) {
        display: none;
    }
`;

const Veil = styled.span`
    position: absolute;
    inset: 0;
    background-color: ${p => p.theme.colors.background};
    animation: ${veilCycle} ${DURATION} ease-in-out both;
`;

const Rule = styled.span`
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
        to right,
        transparent,
        currentColor 18%,
        currentColor 82%,
        transparent
    );
    transform-origin: center;
    animation: ${ruleCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
`;

const Corners = styled.div`
    position: absolute;
    inset: 22px;

    i {
        position: absolute;
        width: 26px;
        height: 26px;
        border-color: currentColor;
        border-style: solid;
        opacity: 0;
        animation: ${cornerCycle} ${DURATION} ease-out both;
    }

    .tl { top: 0; left: 0; border-width: 1px 0 0 1px; }
    .tr { top: 0; right: 0; border-width: 1px 1px 0 0; animation-delay: 0.06s; }
    .bl { bottom: 0; left: 0; border-width: 0 0 1px 1px; animation-delay: 0.12s; }
    .br { bottom: 0; right: 0; border-width: 0 1px 1px 0; animation-delay: 0.18s; }
`;

const Constellation = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    polyline {
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0.5;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) 0.06s both;
    }
`;

const Node = styled.span`
    position: absolute;
    line-height: 1;
    transform: translate(-50%, -50%);
    animation: ${nodeCycle} ${DURATION} ease-out both;
`;

const Art = styled.svg`
    position: relative;
    width: 210px;
    height: 210px;
    overflow: visible;
    animation: ${artCycle} ${DURATION} cubic-bezier(0.33, 0, 0.2, 1) both;

    .ring,
    .orbit,
    .moon {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
    }

    .moon { stroke-width: 1.6; }

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
        animation: ${dotCycle} 0.85s ease-out both;
    }
`;
