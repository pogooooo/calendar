"use client";

import * as React from "react";
import styled, { keyframes, css } from "styled-components";

/**
 * 다운로드 페이지 히어로 아트.
 * 시간(시계 눈금·바늘)과 별자리(궤도·행성)를 겹친 라인 드로잉이다.
 * 사이드바 장식과는 별개의 그림이며 여기서만 쓴다.
 */

const TICKS = Array.from({ length: 60 }, (_, i) => i);

const ORBITS = [
    { rx: 128, ry: 52, tilt: -18, dur: 26, r: 4.5, dir: "normal" as const },
    { rx: 98, ry: 96, tilt: 12, dur: 38, r: 3.2, dir: "reverse" as const },
    { rx: 58, ry: 132, tilt: 34, dur: 30, r: 3.8, dir: "normal" as const },
];

const STARS = [
    { x: 44, y: 62, r: 1.6, d: 0 },
    { x: 268, y: 88, r: 1.2, d: 0.7 },
    { x: 300, y: 214, r: 1.7, d: 1.4 },
    { x: 36, y: 236, r: 1.3, d: 2.1 },
    { x: 148, y: 26, r: 1.1, d: 2.8 },
    { x: 92, y: 300, r: 1.5, d: 3.4 },
    { x: 254, y: 302, r: 1.1, d: 1.9 },
    { x: 18, y: 148, r: 1.2, d: 0.4 },
];

export default function CronosOrbit({ className }: { className?: string }) {
    return (
        <Art className={className} viewBox="0 0 336 336" fill="none" aria-hidden="true">
            <defs>
                <radialGradient id="cronos-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                    <stop offset="55%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="cronos-sweep" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
                </linearGradient>
            </defs>

            {/* 시계 눈금 테두리 */}
            <g className="dial">
                {TICKS.map(i => {
                    const major = i % 5 === 0;
                    return (
                        <line
                            key={i}
                            x1="168"
                            y1={major ? 16 : 20}
                            x2="168"
                            y2={major ? 27 : 24}
                            transform={`rotate(${i * 6} 168 168)`}
                            strokeWidth={major ? 1.4 : 0.7}
                            opacity={major ? 0.65 : 0.28}
                        />
                    );
                })}
            </g>

            <circle className="rim" cx="168" cy="168" r="150" strokeWidth="0.8" opacity="0.3" />
            <circle className="rim dashed" cx="168" cy="168" r="141" strokeWidth="0.7" opacity="0.4" />

            {/* 시침처럼 도는 빛줄기 */}
            <g className="sweep">
                <line x1="168" y1="168" x2="168" y2="46" stroke="url(#cronos-sweep)" strokeWidth="1.6" />
            </g>

            {/* 궤도와 행성 */}
            {ORBITS.map((o, i) => (
                <g key={i} transform={`rotate(${o.tilt} 168 168)`}>
                    <ellipse
                        className="orbit"
                        cx="168"
                        cy="168"
                        rx={o.rx}
                        ry={o.ry}
                        strokeWidth="0.9"
                        opacity="0.45"
                    />
                    <g className="spin" style={{ animationDuration: `${o.dur}s`, animationDirection: o.dir }}>
                        <circle className="planet" cx={168 + o.rx} cy="168" r={o.r} />
                        <circle className="halo" cx={168 + o.rx} cy="168" r={o.r * 2.6} />
                    </g>
                </g>
            ))}

            {/* 중심 */}
            <circle cx="168" cy="168" r="46" fill="url(#cronos-core)" className="core" />
            <circle className="coreRing" cx="168" cy="168" r="17" strokeWidth="1" />
            <g className="burst">
                {[0, 45, 90, 135].map(a => (
                    <line
                        key={a}
                        x1="168"
                        y1="150"
                        x2="168"
                        y2="186"
                        transform={`rotate(${a} 168 168)`}
                        strokeWidth="0.8"
                        opacity="0.5"
                    />
                ))}
            </g>

            {/* 반짝이는 별 */}
            {STARS.map((s, i) => (
                <circle
                    key={i}
                    className="star"
                    cx={s.x}
                    cy={s.y}
                    r={s.r}
                    style={{ animationDelay: `${s.d}s` }}
                />
            ))}
        </Art>
    );
}

const spin = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
`;

const twinkle = keyframes`
    0%, 100% { opacity: 0.15; transform: scale(0.8); }
    50%      { opacity: 0.9;  transform: scale(1.15); }
`;

const breathe = keyframes`
    0%, 100% { opacity: 0.45; }
    50%      { opacity: 0.9; }
`;

const dash = keyframes`
    to { stroke-dashoffset: -240; }
`;

const draw = keyframes`
    from { stroke-dashoffset: 1400; }
    to   { stroke-dashoffset: 0; }
`;

const motion = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

const Art = styled.svg`
    width: 100%;
    height: 100%;
    color: ${p => p.theme.colors.primary};
    stroke: currentColor;
    overflow: visible;

    .dial line { stroke: currentColor; }
    .rim { stroke: currentColor; fill: none; }
    .orbit { stroke: currentColor; fill: none; }
    .coreRing { stroke: currentColor; fill: none; opacity: 0.7; }
    .burst line { stroke: currentColor; }
    .planet { fill: currentColor; stroke: none; }
    .halo { fill: currentColor; stroke: none; opacity: 0.14; }
    .star { fill: currentColor; stroke: none; opacity: 0.4; }

    .dashed { stroke-dasharray: 3 9; }

    ${motion(css`
        .dial { animation: ${spin} 240s linear infinite; transform-origin: 168px 168px; }
        .dashed { animation: ${dash} 40s linear infinite; }
        .sweep { animation: ${spin} 12s linear infinite; transform-origin: 168px 168px; }
        .spin { animation: ${spin} linear infinite; transform-origin: 168px 168px; }
        .core { animation: ${breathe} 6s ease-in-out infinite; }
        .coreRing { animation: ${breathe} 6s ease-in-out infinite reverse; }
        .star { animation: ${twinkle} 4.5s ease-in-out infinite; }
        .orbit {
            stroke-dasharray: 1400;
            animation: ${draw} 2.4s ease-out both;
        }
    `)}
`;
