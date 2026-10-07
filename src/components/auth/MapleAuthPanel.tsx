"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTheme } from "styled-components";
import MapleSpecimen, { type SpecimenState } from "@/components/ambient/maple/MapleSpecimen";
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

/**
 * 로그인 옆의 표본 한 장 — 종이 대지에 테이프로 붙인 오늘의 단풍잎(3D, MapleSpecimen)과 지나가는 잎.
 * 기다리는 동안(busy)에는 잎이 빨리 지고 표본 잎 끝이 떤다.
 * WebGL 이 없으면 예전 그림(도감 한 장 E1·E2 + CSS 로 지는 잎)으로 물러난다.
 */
function MapleAuthPanel({ busy = false }: { busy?: boolean }) {
    const theme = useTheme();
    const panelRef = useRef<HTMLDivElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [mode, setMode] = useState<SpecimenState>("pending");
    const flat = mode === "flat";

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
        <S.BrandPanel
            ref={panelRef}
            $busy={busy}
            // 3D 표본은 제 스스로 커서·기울기를 읽는다 — 예전 그림일 때만 판을 따라 움직인다
            onMouseMove={flat ? handleMouseMove : undefined}
            onMouseLeave={flat ? handleMouseLeave : undefined}
        >
            {flat && (
                <>
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
                </>
            )}

            <MapleSpecimen variant="sheet" busy={busy} avoidRef={brandRef} onState={setMode} />

            <S.BrandContent ref={brandRef}>
                <S.ServiceName>CRONOS</S.ServiceName>
                <S.Rule />
                <S.Tagline>Maple · a field guide of days</S.Tagline>
            </S.BrandContent>
        </S.BrandPanel>
    );
}

export default React.memo(MapleAuthPanel);
