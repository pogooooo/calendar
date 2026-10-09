"use client";

import * as React from "react";
import styled from "styled-components";
import type { DialogKind } from "./arcana";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function ArcanaEmblem({ kind, size }: { kind: DialogKind; size: number }) {
    return (
        <Svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            {/* 바탕 — 점선 고리와 네 방위의 눈금 (Celestial 은 비스듬한 마름모를 쓰지 않는다) */}
            <circle className="ln" cx="50" cy="50" r="27" strokeWidth="0.9" strokeDasharray="2 3.2" opacity="0.55" />
            <path className="ln" strokeWidth="0.9" opacity="0.55" d="M50 16v5M50 79v5M16 50h5M79 50h5" />

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

            {/* XIII — 해를 가리는 달(식). 모래시계의 사선 대신 고리와 그 위에 겹친 어두운 원반 */}
            {kind === "danger" && (
                <>
                    <circle className="ln stroke" pathLength={100} cx="50" cy="50" r="17" strokeWidth="1.5" />
                    <circle className="fl" cx="56" cy="47" r="13" opacity="0.55" />
                    <path className="ln" strokeWidth="1.6" d="M30 28h40M30 72h40" />
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
