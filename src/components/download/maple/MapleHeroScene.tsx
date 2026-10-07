"use client";

import * as React from "react";
import MapleSpecimen, { type SpecimenState } from "@/components/ambient/maple/MapleSpecimen";
import * as S from "./MapleHeroScene.styles";

/** 잎마다 자리·기울기·지연. 고정 값이라 새로 고칠 때마다 같은 자리에 떨어진다 */
const LEAVES = [
    { sprite: 1, x: 12, delay: 0, dur: 9.5, drift: 30 },
    { sprite: 3, x: 34, delay: 1.8, dur: 11, drift: -24 },
    { sprite: 5, x: 58, delay: 0.9, dur: 10.2, drift: 18 },
    { sprite: 7, x: 78, delay: 2.6, dur: 12, drift: -32 },
];

/**
 * Maple 의 소개 그림 — 도감 한 장(H2)을 종이 테이프로 붙인 카드가 3D 로 떠 있고(가운데에 오늘의 잎 하나),
 * 잎이 카드 앞뒤로 천천히 진다(MapleSpecimen "plate"). WebGL 이 없으면 예전의 납작한 한 장과 CSS 잎 넷으로 물러난다.
 */
export default function MapleHeroScene() {
    const [mode, setMode] = React.useState<SpecimenState>("pending");
    return (
        <S.Scene aria-hidden="true" data-ambient="maple-hero">
            {mode === "flat" && (
                <>
                    <S.Plate>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/themes/maple/landing-hero.webp" alt="" draggable={false} />
                    </S.Plate>
                    {LEAVES.map((l) => (
                        <S.Leaf
                            key={l.sprite}
                            src={`/themes/maple/leaves/leaf-${l.sprite}.webp`}
                            alt=""
                            draggable={false}
                            style={{
                                left: `${l.x}%`,
                                animationDelay: `${l.delay}s`,
                                animationDuration: `${l.dur}s`,
                                ["--drift" as string]: `${l.drift}px`,
                            } as React.CSSProperties}
                        />
                    ))}
                </>
            )}
            <MapleSpecimen variant="plate" onState={setMode} />
        </S.Scene>
    );
}
