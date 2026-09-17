"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTheme } from "styled-components";
import * as S from "./MapleAuthPanel.styles";

/** 떨어지는 잎. 자리와 박자를 미리 정해 두어 켤 때마다 같은 장면이 된다 */
const LEAVES = [
    { sprite: 1, x: 8, size: 30, dur: 14, delay: -2, sway: 40 },
    { sprite: 3, x: 22, size: 22, dur: 18, delay: -9, sway: -30 },
    { sprite: 5, x: 38, size: 26, dur: 16, delay: -5, sway: 50 },
    { sprite: 2, x: 55, size: 34, dur: 13, delay: -11, sway: -45 },
    { sprite: 7, x: 68, size: 24, dur: 19, delay: -1, sway: 35 },
    { sprite: 4, x: 84, size: 28, dur: 15, delay: -7, sway: -25 },
];

/** 로그인 옆의 도감 한 장. 기다리는 동안(busy)에는 잎이 빨리 진다. */
function MapleAuthPanel({ busy = false }: { busy?: boolean }) {
    const theme = useTheme();
    const panelRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = panelRef.current?.getBoundingClientRect();
        if (!rect) return;
        setMouse({
            x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
            y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        });
    }, []);
    const handleMouseLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

    const plate = theme.mode === "dark" ? "/themes/maple/auth-dark.webp" : "/themes/maple/auth-light.webp";

    return (
        <S.BrandPanel ref={panelRef} $busy={busy} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="plate"
                src={plate}
                alt=""
                draggable={false}
                style={{ transform: `translate(${mouse.x * -6}px, ${mouse.y * -6}px)` }}
            />

            {LEAVES.map((l) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    key={l.sprite}
                    className="leaf"
                    src={`/themes/maple/leaves/leaf-${l.sprite}.webp`}
                    alt=""
                    draggable={false}
                    style={{
                        ["--x" as string]: `${l.x}%`,
                        ["--size" as string]: `${l.size}px`,
                        ["--dur" as string]: `${l.dur}s`,
                        ["--delay" as string]: `${l.delay}s`,
                        ["--sway" as string]: `${l.sway}px`,
                    } as React.CSSProperties}
                />
            ))}

            <S.BrandContent>
                <S.ServiceName>CRONOS</S.ServiceName>
                <S.Rule />
                <S.Tagline>Maple · a field guide of days</S.Tagline>
            </S.BrandContent>
        </S.BrandPanel>
    );
}

export default React.memo(MapleAuthPanel);
