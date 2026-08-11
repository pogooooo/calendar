"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";

let hasNavigated = false;

// 사이드바(CelestialSidebarDesign)의 초승달과 동일한 path
const MOON_PATH = "M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z";

const C = 200;
const polar = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

// {12/5} 별 다각형 — 한 붓으로 이어지는 고전 마법 문장
const STAR12 = (() => {
    const pts: string[] = [];
    let i = 0;
    for (let n = 0; n < 12; n++) {
        const [x, y] = polar(150, i * 30);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        i = (i + 5) % 12;
    }
    return pts.join(" ");
})();

// 안쪽 육각성 (삼각형 두 개)
const TRI_UP = [0, 120, 240].map(d => polar(92, d).map(v => v.toFixed(1)).join(",")).join(" ");
const TRI_DOWN = [60, 180, 300].map(d => polar(92, d).map(v => v.toFixed(1)).join(",")).join(" ");

const TICKS = Array.from({ length: 48 }, (_, i) => i * 7.5);
const CARDINALS = [0, 90, 180, 270];

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

                    <Frame viewBox="0 0 100 100" preserveAspectRatio="none">
                        <rect x="1.2" y="1.2" width="97.6" height="97.6" pathLength={100} />
                    </Frame>

                    <Corners>
                        <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
                    </Corners>

                    <Sigil viewBox="0 0 400 400">
                        <circle className="rim dashed" cx={C} cy={C} r="190" />
                        <circle className="rim" cx={C} cy={C} r="176" pathLength={100} />

                        <g className="ticks">
                            {TICKS.map((deg, i) => (
                                <line
                                    key={deg}
                                    x1={C}
                                    y1={i % 4 === 0 ? 30 : 36}
                                    x2={C}
                                    y2="44"
                                    transform={`rotate(${deg} ${C} ${C})`}
                                    strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
                                />
                            ))}
                        </g>

                        <polygon className="star12" points={STAR12} pathLength={100} />
                        <circle className="rim thin" cx={C} cy={C} r="150" pathLength={100} />

                        <polygon className="tri" points={TRI_UP} pathLength={100} />
                        <polygon className="tri tri-b" points={TRI_DOWN} pathLength={100} />

                        <circle className="rim thin inner" cx={C} cy={C} r="92" pathLength={100} />

                        <path
                            className="moon"
                            pathLength={100}
                            transform={`translate(${C} ${C}) scale(1.28) translate(-100.389 -232.217)`}
                            d={MOON_PATH}
                        />

                        {CARDINALS.map((deg, i) => (
                            // CSS 애니메이션의 transform 이 속성 transform 을 덮어쓰지 않도록 g 로 감싼다
                            <g key={deg} transform={`rotate(${deg} ${C} ${C})`}>
                                <g transform={`rotate(45 ${C} 9)`}>
                                    <rect
                                        className="pip"
                                        x={C - 5}
                                        y="4"
                                        width="10"
                                        height="10"
                                        style={{ animationDelay: `${0.34 + i * 0.07}s` }}
                                    />
                                </g>
                            </g>
                        ))}
                    </Sigil>
                </Overlay>
            )}
            <Body $animate={animate}>{children}</Body>
        </Stage>
    );
}

const DURATION = "1.45s";

/* 지연이 가장 큰 요소까지 다 그려진 뒤에 지우기 시작하도록 유지 구간을 넉넉히 둔다 */
const strokeCycle = keyframes`
    0%   { stroke-dashoffset: 100; opacity: 0; }
    8%   { opacity: 1; }
    40%  { stroke-dashoffset: 0; }
    72%  { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: -100; opacity: 0; }
`;

const fadeCycle = keyframes`
    0%   { opacity: 0; }
    25%  { opacity: 1; }
    66%  { opacity: 1; }
    100% { opacity: 0; }
`;

const pipCycle = keyframes`
    0%   { opacity: 0; transform: scale(0.3); }
    40%  { opacity: 1; transform: scale(1); }
    70%  { opacity: 1; }
    100% { opacity: 0; transform: scale(1.3); }
`;

const turn = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(24deg); }
`;

const turnBack = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(-18deg); }
`;

const sigilCycle = keyframes`
    0%   { transform: scale(0.9); }
    58%  { transform: scale(1); }
    100% { transform: scale(1.07); }
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
            animation: ${bodyIn} 0.6s ease-out 0.62s both;
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

/* 타로 카드 테두리처럼 화면을 한 바퀴 그린다 */
const Frame = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    rect {
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        opacity: 0.45;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
    }
`;

const Corners = styled.div`
    position: absolute;
    inset: 26px;

    i {
        position: absolute;
        width: 9px;
        height: 9px;
        border: 1px solid currentColor;
        transform: rotate(45deg);
        opacity: 0;
        animation: ${pipCycle} ${DURATION} ease-out both;
    }

    .tl { top: -4px; left: -4px; }
    .tr { top: -4px; right: -4px; animation-delay: 0.06s; }
    .bl { bottom: -4px; left: -4px; animation-delay: 0.12s; }
    .br { bottom: -4px; right: -4px; animation-delay: 0.18s; }
`;

const Sigil = styled.svg`
    position: relative;
    width: min(58vh, 400px);
    height: min(58vh, 400px);
    overflow: visible;
    animation: ${sigilCycle} ${DURATION} cubic-bezier(0.33, 0, 0.2, 1) both;

    .rim,
    .star12,
    .tri,
    .moon {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
    }

    .rim,
    .star12,
    .tri,
    .moon {
        stroke-dasharray: 100;
        animation: ${strokeCycle} ${DURATION} cubic-bezier(0.4, 0, 0.3, 1) both;
    }

    .rim { stroke-width: 0.9; opacity: 0.5; }
    .rim.thin { stroke-width: 0.7; opacity: 0.42; }
    .rim.inner { animation-delay: 0.1s; }

    .dashed {
        stroke-width: 0.7;
        stroke-dasharray: 2 7;
        opacity: 0.4;
        animation: ${fadeCycle} ${DURATION} ease-in-out both, ${turn} ${DURATION} linear both;
        transform-origin: ${C}px ${C}px;
    }

    .ticks {
        opacity: 0;
        transform-origin: ${C}px ${C}px;
        animation: ${fadeCycle} ${DURATION} ease-in-out 0.05s both, ${turnBack} ${DURATION} linear both;

        line {
            stroke: currentColor;
            vector-effect: non-scaling-stroke;
            opacity: 0.55;
        }
    }

    .star12 {
        stroke-width: 0.9;
        opacity: 0.7;
        animation-delay: 0.06s;
    }

    .tri {
        stroke-width: 0.8;
        opacity: 0.55;
        animation-delay: 0.13s;
    }

    .tri-b { animation-delay: 0.16s; }

    .moon {
        stroke-width: 1.5;
        animation-delay: 0.09s;
    }

    .pip {
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: ${pipCycle} 0.9s ease-out both;
    }
`;
