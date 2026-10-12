"use client";

import * as React from "react";
import * as S from "./CelestialPageTransition.styles";
import useThemeMotion from '@/hooks/useThemeMotion';
import { f, litPath, ringPath, star4Path } from "@/components/ornament/celestial/CelestialOrnaments";

let hasNavigated = false;

// 사이드바의 초승달과 같은 꼴
const MOON_PATH = "M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z";

const polar = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [f(S.C + r * Math.cos(a)), f(S.C + r * Math.sin(a))] as const;
};

/** 둘레의 눈금 — 7.5° 마다, 30° 마다 길게 */
const TICKS = Array.from({ length: 48 }, (_, i) => i * 7.5);
/** 둘레를 도는 달의 위상 여덟 — 위(삭)에서 시계 방향으로 차올라 아래가 보름, 다시 기운다 */
const PHASES = Array.from({ length: 8 }, (_, i) => ({ deg: i * 45, phase: i / 8 }));
const CARDINALS = [0, 90, 180, 270];
/** 혼천의의 반지름 */
const AR = 112;

/**
 * Celestial 의 화면 바뀜 — 화면 테를 한 바퀴 긋고, 가운데에 혼천의 문장이 그려졌다 지워진다.
 * 문장은 곧은 축·자오환·적도환·기운 황도환(혼천의), 둘레를 도는 달의 위상 여덟, 네 방위의 네 갈래 별, 가운데 초승달.
 * 비스듬한 선(별 다각형·육각성·마름모)은 쓰지 않는다. 오는 쪽(direction)에 따라 둘레의 점선 고리가 도는 쪽이 바뀐다.
 */
export default function CelestialPageTransition({ children, direction = 1 }: { children: React.ReactNode; direction?: number }) {
    const motion = useThemeMotion();
    // 이 화면에 들어온 그 순간에 한 번만 정한다 — 그릴 때마다 정하면, 첫 화면이 다시 그려지거나 움직임 설정을 바꿀 때(끄기 → 켜기)
    // 화면을 옮기지 않았는데도 문양이 다시 그려졌다
    const [animate] = React.useState(() => hasNavigated && motion !== 'off');

    React.useEffect(() => {
        hasNavigated = true;
    }, []);

    return (
        <S.Stage>
            {animate && (
                <S.Overlay aria-hidden="true" data-page-transition-overlay style={{ "--turn": `${direction < 0 ? -24 : 24}deg` } as React.CSSProperties}>
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

                        <circle className="rim thin" cx={S.C} cy={S.C} r="150" pathLength={100} />

                        {/* 달의 위상 — 둘레를 따라 삭에서 보름을 지나 다시 삭으로 */}
                        <g className="phases">
                            {PHASES.map(({ deg, phase }) => {
                                const [x, y] = polar(163, deg);
                                return (
                                    <g key={deg}>
                                        <circle className="disc" cx={x} cy={y} r="7" />
                                        {phase === 0.5
                                            ? <circle className="lit" cx={x} cy={y} r="7" />
                                            : phase > 0 && <path className="lit" d={litPath(x, y, 7, phase)} />}
                                    </g>
                                );
                            })}
                        </g>

                        {/* 혼천의 — 곧은 축(가운데는 달 자리로 비운다), 자오환, 적도환, 기운 황도환, 둘째 자오환 */}
                        <path className="axis" pathLength={100} d={`M${S.C} 50V${S.C - 34}M${S.C} ${S.C + 34}V350`} />
                        <g className="ends">
                            <circle cx={S.C} cy="50" r="2.6" />
                            <circle cx={S.C} cy="350" r="2.6" />
                        </g>
                        <circle className="ring" cx={S.C} cy={S.C} r={AR} pathLength={100} />
                        <ellipse className="ring" cx={S.C} cy={S.C} rx={AR} ry={f(AR * 0.26)} pathLength={100} />
                        <path className="ring ecl" d={ringPath(S.C, S.C, AR, AR * 0.3, -23.4)} pathLength={100} />
                        <ellipse className="ring thin" cx={S.C} cy={S.C} rx={f(AR * 0.3)} ry={AR} pathLength={100} />

                        <path
                            className="moon"
                            pathLength={100}
                            transform={`translate(${S.C} ${S.C}) scale(0.9) translate(-100.389 -232.217)`}
                            d={MOON_PATH}
                        />

                        {/* 네 방위의 네 갈래 별 — 점선 고리 위에 */}
                        {CARDINALS.map((deg, i) => {
                            const [x, y] = polar(190, deg);
                            return <path key={deg} className="pip" d={star4Path(x, y, 10)} style={{ animationDelay: `${0.34 + i * 0.07}s` }} />;
                        })}
                    </S.Sigil>
                </S.Overlay>
            )}
            <S.Body $animate={animate}>{children}</S.Body>
        </S.Stage>
    );
}

/* height 를 auto 로 풀면 안 된다. 안쪽 화면들이 height:100% 로 자리를 잡는데,
   부모 높이가 auto 가 되면 그 100% 가 풀리지 않아 달력 격자가 제 높이를 잃는다.
   화면 아래가 탭바에 가리는 문제는 AppShell 이 탭바 자리를 떼는 쪽으로 푼다. */
