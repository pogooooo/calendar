"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import * as S from "./CelestialAuthPanel.styles";
import { f, litPath, ringPath } from "@/components/ornament/celestial/CelestialOrnaments";

export { BrandPanel, BrandContent, ServiceName } from "./CelestialAuthPanel.styles";

const CX = 260, CY = 350;
const R = { r1: 58, r2: 115, r3: 175, r4: 235 };
/** 극좌표 → 좌표 (소수 둘째 자리 — 서버와 브라우저의 Math.cos 끝자리가 달라 하이드레이션이 어긋나지 않게) */
const at = (r: number, a: number) => [f(CX + Math.cos(a) * r), f(CY + Math.sin(a) * r)] as const;

/** 가운데 고리의 짧은 빛살 — 해와 달 문장처럼 길고 짧은 것이 번갈아. 글자(CRONOS)가 지나는 가로 띠에는 두지 않는다 */
const RAYS = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const [x1, y1] = at(R.r1 + 7, a);
    const [x2, y2] = at(R.r1 + (i % 2 ? 15 : 24), a);
    return { x1, y1, x2, y2, main: i % 8 === 0, clear: Math.abs(Math.sin(a)) > 0.4 };
}).filter((r) => r.clear);
/** 둘레를 도는 달의 위상 여덟 — 위(삭)에서 시계 방향으로 차올라 아래가 보름 */
const MOONS = Array.from({ length: 8 }, (_, i) => {
    const [x, y] = at((R.r2 + R.r3) / 2, (i / 8) * Math.PI * 2 - Math.PI / 2);
    return { x, y, phase: i / 8 };
});
const OUTER_MAJOR = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const [x1, y1] = at(R.r4 + 8, a);
    const [x2, y2] = at(R.r4 + 27, a);
    return { x1, y1, x2, y2 };
});
const OUTER_MINOR = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const [x1, y1] = at(R.r4 + 12, a);
    const [x2, y2] = at(R.r4 + 22, a);
    return { x1, y1, x2, y2 };
});
/** 혼천의의 기운 황도환 — 행성이 이 길을 따라 돈다 */
const ECLIPTIC = ringPath(CX, CY, R.r3, R.r3 * 0.32, -23.4);

/**
 * 로그인·가입 옆의 그림 — 곧은 축과 동심원, 가운데 고리의 짧은 빛살, 둘레를 도는 달의 위상, 혼천의(가로 적도환과 기운 황도환),
 * 궤도를 도는 행성, 바깥 눈금 고리. 길게 가로지르는 사선(방사선)과 기운 타원 궤도는 쓰지 않는다 — 기운 것은 혼천의의 황도환 하나.
 * 로그인 중(busy)이면 도는 것들이 빨라진다.
 */
function CelestialAuthPanel({ busy = false }: { busy?: boolean }) {
    const panelRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const rafRef = useRef(0);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || typeof svg.getAnimations !== 'function') return;
        const anims = svg.getAnimations({ subtree: true });
        if (anims.length === 0) return;

        const target = busy ? 7 : 1;
        cancelAnimationFrame(rafRef.current);

        const step = () => {
            let settled = true;
            anims.forEach(anim => {
                const next = anim.playbackRate + (target - anim.playbackRate) * 0.06;
                if (Math.abs(next - target) < 0.03) {
                    anim.playbackRate = target;
                } else {
                    anim.playbackRate = next;
                    settled = false;
                }
            });
            if (!settled) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);

        return () => cancelAnimationFrame(rafRef.current);
    }, [busy]);

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
        <S.BrandPanel ref={panelRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <svg
                ref={svgRef}
                width="100%" height="100%"
                viewBox="0 0 520 700"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", inset: 0, color: "var(--auth-ink)" }}
                aria-hidden
            >
                {/* ━━━ Layer 0 — 곧은 축선, 끝엔 점 (최소 시차) ━━━━━━━━━━━━━━━━━ */}
                <g style={parallax(2)}>
                    <line x1="260" y1="0"   x2="260" y2="700" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.28" />
                    <line x1="0"   y1="350" x2="520" y2="350" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.28" />
                    {/* 축과 나란한 곁줄 — 위아래로만, 끝에 점 */}
                    <line x1="244" y1="40" x2="244" y2="92" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                    <line x1="276" y1="608" x2="276" y2="660" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                    <circle cx="244" cy="40" r="1.6" fill="currentColor" fillOpacity="0.5" />
                    <circle cx="276" cy="660" r="1.6" fill="currentColor" fillOpacity="0.5" />
                </g>

                {/* ━━━ Layer 1 — r1 고리와 그 둘레의 짧은 빛살 (약한 시차) ━━━━━━━━ */}
                <g style={parallax(4)}>
                    {/* 빛살은 돌지 않는다 — 돌면 글자 띠로 들어온다 */}
                    <g>
                        {RAYS.map(({ x1, y1, x2, y2, main }, i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="currentColor"
                                strokeWidth={main ? "0.8" : "0.5"}
                                strokeOpacity={main ? "0.5" : "0.3"}
                            />
                        ))}
                    </g>
                    <S.BreathCircle cx={CX} cy={CY} r={R.r1}
                        stroke="currentColor" strokeWidth="0.8" strokeOpacity="1" $delay="0s" />
                    <circle cx={CX} cy={CY} r={R.r1 - 8} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="2 4" />
                </g>

                {/* ━━━ Layer 2 — r2·r3 동심원, 달의 위상, 혼천의, 행성 (중간 시차) ━━━ */}
                <g style={parallax(7)}>
                    <circle cx={CX} cy={CY} r={R.r2}
                        stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
                    <circle cx={CX} cy={CY} r={R.r3}
                        stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.70" />

                    {/* 축선 × 원 교차 마커 */}
                    {[R.r2, R.r3].flatMap(r => [
                        <line key={`t${r}`} x1={CX-9} y1={CY-r} x2={CX+9} y2={CY-r} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`b${r}`} x1={CX-9} y1={CY+r} x2={CX+9} y2={CY+r} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`l${r}`} x1={CX-r} y1={CY-9} x2={CX-r} y2={CY+9} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.60" />,
                        <line key={`rt${r}`} x1={CX+r} y1={CY-9} x2={CX+r} y2={CY+9} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.60" />,
                    ])}

                    {/* 달의 위상 — r2 와 r3 사이를 따라 삭에서 보름을 지나 다시 삭으로 */}
                    {MOONS.map(({ x, y, phase }) => (
                        <g key={phase}>
                            <circle cx={x} cy={y} r="9" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.6" />
                            {phase === 0.5
                                ? <circle cx={x} cy={y} r="9" fill="currentColor" fillOpacity="0.7" />
                                : phase > 0 && <path d={litPath(x, y, 9, phase)} fill="currentColor" fillOpacity="0.7" />}
                        </g>
                    ))}

                    {/* 혼천의 — 가로 적도환과 기운 황도환(점선), 황도환 위를 도는 행성 */}
                    <ellipse cx={CX} cy={CY} rx={R.r3} ry={f(R.r3 * 0.27)}
                        stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.5" strokeDasharray="6 5" />
                    <path d={ECLIPTIC} stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.44" strokeDasharray="4 4" />
                    <S.Planet cx="0" cy="0" r="3.6" fill="currentColor" fillOpacity="0.8" style={{ offsetPath: `path("${ECLIPTIC}")` }} />

                    {/* r2 행성 */}
                    <S.RotCW $dur="22s">
                        <circle cx={CX + R.r2} cy={CY} r="4.5" fill="currentColor" fillOpacity="0.82" />
                        <circle cx={CX + R.r2} cy={CY} r="7.5" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.42" fill="none" />
                    </S.RotCW>
                    {/* r3 행성 */}
                    <S.RotCW $dur="42s" style={{ animationDelay: "-14s" }}>
                        <circle cx={CX + R.r3} cy={CY} r="5" fill="currentColor" fillOpacity="0.78" />
                        <circle cx={CX + R.r3} cy={CY} r="8.5" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.40" fill="none" />
                    </S.RotCW>
                </g>

                {/* ━━━ Layer 3 — r4 외곽 + 눈금 링 + r4 행성 (가장 큰 시차) */}
                <g style={parallax(12)}>
                    <S.BreathCircle cx={CX} cy={CY} r={R.r4}
                        stroke="currentColor" strokeWidth="0.8" strokeOpacity="1" $delay="2.5s" />

                    <S.RotCW $dur="80s">
                        <circle cx={CX} cy={CY} r={R.r4 + 18}
                            stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.52" />
                        {OUTER_MAJOR.map(({ x1, y1, x2, y2 }, i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.75" />
                        ))}
                        {OUTER_MINOR.map(({ x1, y1, x2, y2 }, i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.48" />
                        ))}
                    </S.RotCW>

                    {/* r4 행성 */}
                    <S.RotCW $dur="70s" style={{ animationDelay: "-46.7s" }}>
                        <circle cx={CX + R.r4} cy={CY} r="4" fill="currentColor" fillOpacity="0.74" />
                        <circle cx={CX + R.r4} cy={CY} r="7" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.38" fill="none" />
                    </S.RotCW>
                </g>

            </svg>

            <S.BrandContent>
                <S.ServiceName>CRONOS</S.ServiceName>
            </S.BrandContent>
        </S.BrandPanel>
    );
}

export default React.memo(CelestialAuthPanel);
