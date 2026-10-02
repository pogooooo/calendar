"use client";

import * as React from "react";
import * as S from "./CelestialPageTransition.styles";
import useThemeMotion from '@/hooks/useThemeMotion';

let hasNavigated = false;

// 사이드바(CelestialSidebarDesign)의 초승달과 동일한 path
const MOON_PATH = "M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z";

const polar = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [S.C + r * Math.cos(a), S.C + r * Math.sin(a)] as const;
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
    const motion = useThemeMotion();
    const animate = hasNavigated && motion !== 'off';

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <S.Stage>
            {animate && (
                <S.Overlay aria-hidden="true" data-page-transition-overlay>
                    <S.Veil />

                    <S.Frame viewBox="0 0 100 100" preserveAspectRatio="none">
                        <rect x="1.2" y="1.2" width="97.6" height="97.6" pathLength={100} />
                    </S.Frame>

                    <S.Corners>
                        <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
                    </S.Corners>

                    <S.Sigil viewBox="0 0 400 400">
                        <circle className="rim dashed" cx={S.C} cy={S.C} r="190" />
                        <circle className="rim" cx={S.C} cy={S.C} r="176" pathLength={100} />

                        <g className="ticks">
                            {TICKS.map((deg, i) => (
                                <line
                                    key={deg}
                                    x1={S.C}
                                    y1={i % 4 === 0 ? 30 : 36}
                                    x2={S.C}
                                    y2="44"
                                    transform={`rotate(${deg} ${S.C} ${S.C})`}
                                    strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
                                />
                            ))}
                        </g>

                        <polygon className="star12" points={STAR12} pathLength={100} />
                        <circle className="rim thin" cx={S.C} cy={S.C} r="150" pathLength={100} />

                        <polygon className="tri" points={TRI_UP} pathLength={100} />
                        <polygon className="tri tri-b" points={TRI_DOWN} pathLength={100} />

                        <circle className="rim thin inner" cx={S.C} cy={S.C} r="92" pathLength={100} />

                        <path
                            className="moon"
                            pathLength={100}
                            transform={`translate(${S.C} ${S.C}) scale(1.28) translate(-100.389 -232.217)`}
                            d={MOON_PATH}
                        />

                        {CARDINALS.map((deg, i) => (
                            // CSS 애니메이션의 transform 이 속성 transform 을 덮어쓰지 않도록 g 로 감싼다
                            <g key={deg} transform={`rotate(${deg} ${S.C} ${S.C})`}>
                                <g transform={`rotate(45 ${S.C} 9)`}>
                                    <rect
                                        className="pip"
                                        x={S.C - 5}
                                        y="4"
                                        width="10"
                                        height="10"
                                        style={{ animationDelay: `${0.34 + i * 0.07}s` }}
                                    />
                                </g>
                            </g>
                        ))}
                    </S.Sigil>
                </S.Overlay>
            )}
            <S.Body $animate={animate}>{children}</S.Body>
        </S.Stage>
    );
}

/**
 * 문양이 그려졌다 지워지는 시간.
 *
 * 넓은 화면에서는 1.45초가 근사하지만, 폰에서는 탭을 자주 오가므로
 * 매번 기다리는 느낌이 된다. CSS 변수로 두고 폰에서만 짧게 줄인다.
 */


/* height 를 auto 로 풀면 안 된다. 안쪽 화면들이 height:100% 로 자리를 잡는데,
   부모 높이가 auto 가 되면 그 100% 가 풀리지 않아 달력 격자가 제 높이를 잃는다.
   화면 아래가 탭바에 가리는 문제는 AppShell 이 탭바 자리를 떼는 쪽으로 푼다. */
