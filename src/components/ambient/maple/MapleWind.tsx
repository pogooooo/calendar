"use client";
/**
 * 단풍 가지와 바람 — 가지의 움직이지 않는 부분(햇살·먼 잎·가지 나무)은 캔버스 한 장(MapleCanopy)이 그리고, 잎은 바람 장면
 * (windScene, three.js)이 그 위에 그린다. 장면이 첫 장을 그린 뒤에 캔버스를 뒤판만 남기게 바꿔 넘어가는 자리가 보이지 않는다.
 * 움직임 '끄기'면 바람 장면 없이 캔버스가 잎까지 모두 그린 멈춘 한 장. WebGL 이 서지 않아도 그 멈춘 한 장에 fallback 을 더한다.
 * screen: 앱 바탕(MapleAtmosphere) · panel: 로그인 옆 그림판(MapleAuthPanel) — 부모 상자를 채운다.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import { webglAvailable } from "@/lib/webgl";
import MapleCanopy from "./MapleCanopy";
import type { WindScene } from "./windScene";
import * as S from "./MapleWind.styles";

export default function MapleWind({ variant, fallback = null }: { variant: "screen" | "panel"; fallback?: ReactNode }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const [flat, setFlat] = useState(false);
    const [live, setLive] = useState(false);
    const dark = theme.mode === "dark";
    const paper = theme.colors.background;
    const still = motion === "off";

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || flat || still) return;
        if (!webglAvailable()) { setFlat(true); return; }
        let disposed = false;
        let scene: WindScene | null = null;
        (async () => {
            try {
                const [THREE, { createWindScene }] = await Promise.all([import("three"), import("./windScene")]);
                if (disposed) return;
                const s = await createWindScene(THREE, canvas, { dark, motion, paper, variant, onReady: () => { if (!disposed) setLive(true); } });
                if (disposed) { s.dispose(); return; }
                scene = s;
            } catch {
                if (!disposed) setFlat(true); // WebGL 이 서지 않는다 — 멈춘 가지로
            }
        })();
        return () => { disposed = true; scene?.dispose(); setLive(false); };
    }, [dark, motion, paper, flat, still, variant]);

    return <>
        <MapleCanopy variant={variant} backdrop={live && !still && !flat} />
        {flat ? fallback : !still && <S.Leaves ref={ref} aria-hidden="true" data-ready={live ? "" : undefined} />}
    </>;
}
