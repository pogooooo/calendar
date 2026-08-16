"use client";

import * as React from "react";
import styled from "styled-components";
import type { DialogKind } from "./arcana";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function ArcanaEmblem({ kind, size }: { kind: DialogKind; size: number }) {
    return (
        <Svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <rect
                className="ln"
                x="28" y="28" width="44" height="44"
                transform="rotate(45 50 50)"
                strokeWidth="0.9"
                opacity="0.55"
            />

            {kind === "info" && (
                <>
                    <path className="ln stroke" pathLength={100} strokeWidth="1.5" d="M32 34v38M68 34v38" />
                    <path className="ln stroke" pathLength={100} strokeWidth="1.6" d="M55 44a11 11 0 1 0 0 18 13 13 0 1 1 0-18z" />
                    <path className="ln" strokeWidth="0.8" opacity="0.5" d="M26 34h48M26 72h48" />
                </>
            )}

            {kind === "confirm" && (
                <>
                    <circle className="ln stroke" pathLength={100} cx="41" cy="53" r="17" strokeWidth="1.4" />
                    <circle className="ln stroke" pathLength={100} cx="59" cy="53" r="17" strokeWidth="1.4" />
                    <path className="fl" d="M50 24l2.2 5.6L58 32l-5.8 2.4L50 40l-2.2-5.6L42 32l5.8-2.4z" />
                </>
            )}

            {kind === "danger" && (
                <>
                    <path className="ln stroke" pathLength={100} strokeWidth="1.5" d="M34 30h32L50 50 66 70H34L50 50z" />
                    <path className="ln" strokeWidth="1.6" d="M30 28h40M30 72h40" />
                    <path className="fl" opacity="0.55" d="M50 50l7 14H43z" />
                </>
            )}

            {kind === "ok" && (
                <>
                    <circle className="ln stroke" pathLength={100} cx="50" cy="50" r="15" strokeWidth="1.5" />
                    {RAYS.map(deg => (
                        <line
                            key={deg}
                            className="ln"
                            x1="50" y1="26" x2="50" y2="32"
                            strokeWidth="1.4"
                            transform={`rotate(${deg} 50 50)`}
                        />
                    ))}
                </>
            )}
        </Svg>
    );
}

const Svg = styled.svg`
    display: block;
    overflow: visible;
    flex-shrink: 0;

    .ln {
        fill: none;
        stroke: ${p => p.theme.colors.primary};
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
    }

    .fl {
        fill: ${p => p.theme.colors.primary};
    }
`;
