"use client";

import React, { useRef, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";

/* ── keyframes ───────────────────────────────────────────────────────────── */
const rotCW  = keyframes`from{transform:rotate(0deg)}  to{transform:rotate(360deg)}`;
const rotCCW = keyframes`from{transform:rotate(0deg)}  to{transform:rotate(-360deg)}`;
const breath = keyframes`0%,100%{opacity:.40} 50%{opacity:.72}`;

/* ── Animated Groups ─────────────────────────────────────────────────────── */
const RotCW = styled.g<{ $dur: string }>`
    transform-origin: 260px 350px;
    animation: ${rotCW} ${p => p.$dur} linear infinite;
`;
const RotCCW = styled.g<{ $dur: string }>`
    transform-origin: 260px 350px;
    animation: ${rotCCW} ${p => p.$dur} linear infinite;
`;
const BreathCircle = styled.circle<{ $delay?: string }>`
    animation: ${breath} 5s ease-in-out infinite;
    animation-delay: ${p => p.$delay ?? "0s"};
`;

/* ── Panel ───────────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;
export const BrandPanel = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.theme.colors.surface};
    border-right: 1px solid ${p => p.theme.colors.primary};
    overflow: hidden;
`;
export const BrandContent = styled.div`
    position: relative;
    z-index: 1;
    text-align: center;
    animation: ${fadeUp} 0.9s ease both;
`;
export const ServiceName = styled.h1`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 3rem;
    font-weight: 400;
    color: ${p => p.theme.colors.primary};
    letter-spacing: 0.32em;
    margin: 0;
    line-height: 1;
`;

/* ── Component ───────────────────────────────────────────────────────────── */
function CelestialAuthPanel() {
    const CX = 260, CY = 350;
    const R = { r1: 58, r2: 115, r3: 175, r4: 235 };

    const panelRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = panelRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        setMouse({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

    /* 시차 레이어 헬퍼 */
    const parallax = (factor: number) => ({
        transform: `translate(${mouse.x * factor}px, ${mouse.y * factor}px)`,
        transition: "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
    });

    return (
        <BrandPanel ref={panelRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <svg
                width="100%" height="100%"
                viewBox="0 0 520 700"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", inset: 0 }}
                aria-hidden
            >
                {/* ━━━ Layer 0 — 축선 (최소 시차) ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <g style={parallax(2)}>
                    <line x1="260" y1="0"   x2="260" y2="700" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.28" />
                    <line x1="0"   y1="350" x2="520" y2="350" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.28" />
                </g>

                {/* ━━━ Layer 1 — 방사선 + r1 내부원 (약한 시차) ━━━━━━━━━━━ */}
                <g style={parallax(4)}>
                    <RotCW $dur="240s">
                        {Array.from({ length: 16 }, (_, i) => {
                            const a = (i / 16) * Math.PI * 2;
                            const isMain = i % 4 === 0;
                            return (
                                <line key={i}
                                    x1={CX + Math.cos(a) * R.r1}
                                    y1={CY + Math.sin(a) * R.r1}
                                    x2={CX + Math.cos(a) * R.r4}
                                    y2={CY + Math.sin(a) * R.r4}
                                    stroke="#D4AF37"
                                    strokeWidth={isMain ? "0.7" : "0.4"}
                                    strokeOpacity={isMain ? "0.32" : "0.20"}
                                />
                            );
                        })}
                    </RotCW>
                    <BreathCircle cx={CX} cy={CY} r={R.r1}
                        stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="1" $delay="0s" />
                </g>

                {/* ━━━ Layer 2 — r2·r3 동심원 + 교차 마커 (중간 시차) ━━━━━ */}
                <g style={parallax(7)}>
                    <circle cx={CX} cy={CY} r={R.r2}
                        stroke="#D4AF37" strokeWidth="1.1" strokeOpacity="0.65" />
                    <circle cx={CX} cy={CY} r={R.r3}
                        stroke="#D4AF37" strokeWidth="1.3" strokeOpacity="0.70" />

                    {/* 축선 × 원 교차 마커 */}
                    {[R.r2, R.r3].flatMap(r => [
                        <line key={`t${r}`} x1={CX-9} y1={CY-r} x2={CX+9} y2={CY-r} stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`b${r}`} x1={CX-9} y1={CY+r} x2={CX+9} y2={CY+r} stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`l${r}`} x1={CX-r} y1={CY-9} x2={CX-r} y2={CY+9} stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`rt${r}`} x1={CX+r} y1={CY-9} x2={CX+r} y2={CY+9} stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.60" />,
                    ])}

                    {/* 기울어진 타원 궤도 2개 */}
                    <RotCW $dur="100s">
                        <ellipse cx={CX} cy={CY}
                            rx={R.r3} ry={R.r2 - 20}
                            transform={`rotate(28 ${CX} ${CY})`}
                            stroke="#D4AF37" strokeWidth="0.9" strokeOpacity="0.52"
                            strokeDasharray="6 5"
                        />
                    </RotCW>
                    <RotCCW $dur="150s">
                        <ellipse cx={CX} cy={CY}
                            rx={R.r4 - 10} ry={R.r3 - 40}
                            transform={`rotate(-42 ${CX} ${CY})`}
                            stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.44"
                            strokeDasharray="4 4"
                        />
                    </RotCCW>

                    {/* r2 행성 */}
                    <RotCW $dur="22s">
                        <circle cx={CX + R.r2} cy={CY} r="4.5" fill="#D4AF37" fillOpacity="0.82" />
                        <circle cx={CX + R.r2} cy={CY} r="7.5" stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.42" fill="none" />
                    </RotCW>
                    {/* r3 행성 */}
                    <RotCW $dur="42s" style={{ animationDelay: "-14s" }}>
                        <circle cx={CX + R.r3} cy={CY} r="5" fill="#D4AF37" fillOpacity="0.78" />
                        <circle cx={CX + R.r3} cy={CY} r="8.5" stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.40" fill="none" />
                    </RotCW>
                </g>

                {/* ━━━ Layer 3 — r4 외곽 + 눈금 링 + r4 행성 (가장 큰 시차) */}
                <g style={parallax(12)}>
                    <BreathCircle cx={CX} cy={CY} r={R.r4}
                        stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="1" $delay="2.5s" />

                    <RotCW $dur="80s">
                        <circle cx={CX} cy={CY} r={R.r4 + 18}
                            stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.52" />
                        {Array.from({ length: 12 }, (_, i) => {
                            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                            return (
                                <line key={i}
                                    x1={CX + Math.cos(a) * (R.r4 + 8)}
                                    y1={CY + Math.sin(a) * (R.r4 + 8)}
                                    x2={CX + Math.cos(a) * (R.r4 + 27)}
                                    y2={CY + Math.sin(a) * (R.r4 + 27)}
                                    stroke="#D4AF37" strokeWidth="1.3" strokeOpacity="0.75"
                                />
                            );
                        })}
                        {Array.from({ length: 48 }, (_, i) => {
                            const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
                            return (
                                <line key={i}
                                    x1={CX + Math.cos(a) * (R.r4 + 12)}
                                    y1={CY + Math.sin(a) * (R.r4 + 12)}
                                    x2={CX + Math.cos(a) * (R.r4 + 22)}
                                    y2={CY + Math.sin(a) * (R.r4 + 22)}
                                    stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.48"
                                />
                            );
                        })}
                    </RotCW>

                    {/* r4 행성 */}
                    <RotCW $dur="70s" style={{ animationDelay: "-46.7s" }}>
                        <circle cx={CX + R.r4} cy={CY} r="4" fill="#D4AF37" fillOpacity="0.74" />
                        <circle cx={CX + R.r4} cy={CY} r="7" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.38" fill="none" />
                    </RotCW>
                </g>

            </svg>

            <BrandContent>
                <ServiceName>CRONOS</ServiceName>
            </BrandContent>
        </BrandPanel>
    );
}

export default React.memo(CelestialAuthPanel);
