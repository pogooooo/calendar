"use client";

import * as React from "react";
import * as S from "./MapleHeroScene.styles";

/** 잎마다 자리·기울기·지연. 고정 값이라 새로 고칠 때마다 같은 자리에 떨어진다 */
const LEAVES = [
    { sprite: 1, x: 12, delay: 0, dur: 9.5, drift: 30 },
    { sprite: 3, x: 34, delay: 1.8, dur: 11, drift: -24 },
    { sprite: 5, x: 58, delay: 0.9, dur: 10.2, drift: 18 },
    { sprite: 7, x: 78, delay: 2.6, dur: 12, drift: -32 },
];

/** Maple 의 소개 그림 — 도는 고리 대신 도감의 한 장(H2)과 그 위로 천천히 지나는 잎 넷 */
export default function MapleHeroScene() {
    return (
        <S.Scene aria-hidden="true">
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
        </S.Scene>
    );
}
