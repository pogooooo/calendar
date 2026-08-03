"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";

const bodyIn = keyframes`
    from { opacity: 0.25; transform: translateY(7px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const veilPass = keyframes`
    0%   { opacity: 0; }
    24%  { opacity: 0.45; }
    100% { opacity: 0; }
`;

const orbRise = keyframes`
    0%   { opacity: 0; transform: rotate(-16deg) scale(0.68); }
    26%  { opacity: 1; }
    72%  { opacity: 0.9; }
    100% { opacity: 0; transform: rotate(9deg) scale(1.2); }
`;

const spinSlow = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(38deg); }
`;

const spinBack = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(-30deg); }
`;

const drawRing = keyframes`
    from { stroke-dashoffset: 460; }
    to   { stroke-dashoffset: 0; }
`;

const drawLine = keyframes`
    from { stroke-dashoffset: 320; }
    to   { stroke-dashoffset: 0; }
`;

const rayFan = keyframes`
    0%   { opacity: 0; transform: scale(0.82); }
    40%  { opacity: 0.9; }
    100% { opacity: 0; transform: scale(1.22); }
`;

const moonTurn = keyframes`
    0%   { opacity: 0; transform: rotate(-38deg) scale(0.8); }
    35%  { opacity: 1; }
    100% { opacity: 0; transform: rotate(12deg) scale(1.08); }
`;

const moonOrbit = keyframes`
    0%   { opacity: 0; transform: rotate(-70deg); }
    30%  { opacity: 1; }
    100% { opacity: 0; transform: rotate(96deg); }
`;

const moonSelfTurn = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(-166deg); }
`;

const nodePop = keyframes`
    0%   { opacity: 0; transform: scale(0); }
    45%  { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.6); }
`;

const sweepOut = keyframes`
    0%   { transform: scaleX(0); opacity: 0; }
    32%  { opacity: 1; }
    100% { transform: scaleX(1); opacity: 0; }
`;

const sparkle = keyframes`
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
    45%  { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(35deg); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(70deg); }
`;

const Stage = styled.div`
    position: relative;
    height: 100%;
`;

const Body = styled.div`
    height: 100%;
    animation: ${bodyIn} 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    overflow: hidden;

    & > * {
        opacity: 0;
    }

    .veil {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at 50% 50%,
            transparent 26%,
            ${(props) => props.theme.colors.background} 100%
        );
        animation: ${veilPass} 0.85s ease-out forwards;
    }

    .orb {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 360px;
        height: 360px;
        margin: -180px 0 0 -180px;
        color: ${(props) => props.theme.colors.primary};
        overflow: visible;
        animation: ${orbRise} 0.9s cubic-bezier(0.25, 0.8, 0.3, 1) forwards;
        filter: drop-shadow(0 0 6px ${(props) => props.theme.colors.primary}55);
    }

    .orb g,
    .orb path,
    .orb circle,
    .orb line {
        transform-origin: 100px 100px;
    }

    .orb .stroke {
        fill: none;
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
    }

    .orb .ring-outer {
        stroke-width: 0.7;
        stroke-dasharray: 3 5;
        opacity: 0.6;
        animation: ${spinSlow} 0.9s linear forwards;
    }

    .orb .ring-main {
        stroke-width: 1;
        stroke-dasharray: 460;
        animation: ${drawRing} 0.75s ease-out forwards;
    }

    .orb .ring-inner {
        stroke-width: 0.6;
        opacity: 0.45;
        stroke-dasharray: 1 6;
        animation: ${spinBack} 0.9s linear forwards;
    }

    .orb .rays {
        animation: ${rayFan} 0.9s ease-out forwards;
    }

    .orb .rays line {
        stroke: currentColor;
        stroke-width: 0.7;
        vector-effect: non-scaling-stroke;
    }

    .orb .moon {
        stroke-width: 1;
        animation: ${moonTurn} 0.85s cubic-bezier(0.3, 0.7, 0.3, 1) forwards;
        transform-origin: 100px 100px;
    }

    .orb .moonlet {
        animation: ${moonOrbit} 0.95s cubic-bezier(0.3, 0.7, 0.3, 1) forwards;
    }

    .orb .moonlet path {
        transform-origin: 100px 30px;
        animation: ${moonSelfTurn} 0.95s linear forwards;
    }

    .orb .moonlet-2 {
        animation: ${moonOrbit} 0.95s cubic-bezier(0.3, 0.7, 0.3, 1) 0.1s forwards;
        opacity: 0;
    }

    .orb .moonlet-2 path {
        transform-origin: 100px 170px;
        animation: ${moonSelfTurn} 0.95s linear 0.1s forwards;
    }

    .orb .constellation {
        stroke-width: 0.7;
        opacity: 0.85;
        stroke-dasharray: 320;
        animation: ${drawLine} 0.8s ease-out 0.06s forwards;
    }

    .orb .node {
        fill: currentColor;
        animation: ${nodePop} 0.7s ease-out both;
    }

    .orb .node:nth-of-type(1) { animation-delay: 0.14s; }
    .orb .node:nth-of-type(2) { animation-delay: 0.22s; }
    .orb .node:nth-of-type(3) { animation-delay: 0.3s; }
    .orb .node:nth-of-type(4) { animation-delay: 0.38s; }

    .sweep {
        position: absolute;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            ${(props) => props.theme.colors.primary} 20%,
            ${(props) => props.theme.colors.primary} 80%,
            transparent
        );
        transform-origin: center;
        animation: ${sweepOut} 0.72s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
    }

    .sweep.up { top: calc(50% - 96px); }
    .sweep.down { top: calc(50% + 96px); animation-delay: 0.06s; }

    .spark {
        position: absolute;
        width: 16px;
        height: 16px;
        color: ${(props) => props.theme.colors.primary};
        overflow: visible;
        animation: ${sparkle} 0.8s ease-out forwards;
    }

    .spark path {
        fill: none;
        stroke: currentColor;
        stroke-width: 1.1;
        vector-effect: non-scaling-stroke;
    }

    .spark.s1 { top: 34%; left: 34%; animation-delay: 0.1s; }
    .spark.s2 { top: 30%; left: 66%; animation-delay: 0.2s; width: 22px; height: 22px; }
    .spark.s3 { top: 68%; left: 40%; animation-delay: 0.3s; width: 12px; height: 12px; }
    .spark.s4 { top: 63%; left: 63%; animation-delay: 0.16s; }
`;

const RAYS = Array.from({ length: 32 }, (_, i) => i * 11.25);
const SPARK_PATH = "M50 4 C54 34, 66 46, 96 50 C66 54, 54 66, 50 96 C46 66, 34 54, 4 50 C34 46, 46 34, 50 4 Z";

export default function CelestialPageTransition({ children }: { children: React.ReactNode }) {
    return (
        <Stage>
            <Overlay aria-hidden="true">
                <span className="veil" />

                <svg className="orb" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <g className="rays">
                        {RAYS.map((deg, i) => (
                            <line
                                key={deg}
                                x1="100"
                                y1={i % 2 === 0 ? 12 : 18}
                                x2="100"
                                y2="24"
                                transform={`rotate(${deg} 100 100)`}
                            />
                        ))}
                    </g>

                    <circle className="stroke ring-outer" cx="100" cy="100" r="86" />
                    <circle className="stroke ring-main" cx="100" cy="100" r="70" />
                    <circle className="stroke ring-inner" cx="100" cy="100" r="56" />

                    <path
                        className="stroke moon"
                        d="M100 66 a34 34 0 1 0 0 68 a27 27 0 1 1 0 -68 z"
                    />

                    <g className="moonlet">
                        <path className="stroke" d="M100 23 a7 7 0 1 0 0 14 a5.5 5.5 0 1 1 0 -14 z" />
                    </g>
                    <g className="moonlet moonlet-2">
                        <path className="stroke" d="M100 164 a5 5 0 1 0 0 10 a4 4 0 1 1 0 -10 z" />
                    </g>

                    <path
                        className="stroke constellation"
                        d="M46 128 L74 96 L108 112 L138 74"
                    />
                    <circle className="node" cx="46" cy="128" r="2" />
                    <circle className="node" cx="74" cy="96" r="2.4" />
                    <circle className="node" cx="108" cy="112" r="2" />
                    <circle className="node" cx="138" cy="74" r="2.6" />
                </svg>

                <span className="sweep up" />
                <span className="sweep down" />

                <svg className="spark s1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d={SPARK_PATH} />
                </svg>
                <svg className="spark s2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d={SPARK_PATH} />
                </svg>
                <svg className="spark s3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d={SPARK_PATH} />
                </svg>
                <svg className="spark s4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d={SPARK_PATH} />
                </svg>
            </Overlay>

            <Body>{children}</Body>
        </Stage>
    );
}
