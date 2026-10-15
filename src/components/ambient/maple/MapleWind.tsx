"use client";
/**
 * 단풍 가지와 바람 — 가지의 움직이지 않는 부분(햇살·먼 잎·가지 나무)은 캔버스 한 장(MapleCanopy)이 그리고, 잎은 바람 장면
 * (windScene, three.js)이 그 위에 그린다. 넘겨받기는 한 장면 안에서: 장면은 첫 장(멈춘 그림과 같은 자세)으로 기다리다가,
 * 가지 캔버스가 다 나타난 뒤 그 캔버스를 뒤판만 남기게 바꾸는 바로 그 장면에 보이며 움직이기 시작한다 — 겹쳐 그리는 동안
 * 그림자가 짙어졌다 한꺼번에 옅어지거나 잎이 깜빡이지 않게.
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

/** 가지 캔버스가 처음 나타나는 데 걸리는 시간(MapleCanopy.styles 의 0.9초 + 첫 그림까지 넉넉히) — 그 뒤에 넘겨받는다 */
const SETTLE_MS = 1300;

export default function MapleWind({ variant, fallback = null }: { variant: "screen" | "panel"; fallback?: ReactNode }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const [flat, setFlat] = useState(false);
    /** 장면이 넘겨받았다 — 장면 캔버스가 보이고 가지 캔버스는 뒤판만 */
    const [live, setLive] = useState(false);
    const mountedAt = useRef(0);
    useEffect(() => { mountedAt.current = performance.now(); }, []);
    const dark = theme.mode === "dark";
    const paper = theme.colors.background;
    const still = motion === "off";

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || flat || still) return;
        if (!webglAvailable()) { setFlat(true); return; }
        let disposed = false;
        let scene: WindScene | null = null;
        let timer = 0;
        const onReady = () => {
            if (disposed) return;
            const wait = Math.max(0, mountedAt.current + SETTLE_MS - performance.now());
            timer = window.setTimeout(() => {
                if (disposed) return;
                setLive(true);
                scene?.start();
            }, wait);
        };
        (async () => {
            try {
                const [THREE, { createWindScene }] = await Promise.all([import("three"), import("./windScene")]);
                if (disposed) return;
                const s = await createWindScene(THREE, canvas, { dark, motion, paper, variant, onReady });
                if (disposed) { s.dispose(); return; }
                scene = s;
            } catch {
                if (!disposed) setFlat(true); // WebGL 이 서지 않는다 — 멈춘 가지로
            }
        })();
        return () => { disposed = true; window.clearTimeout(timer); scene?.dispose(); setLive(false); };
    }, [dark, motion, paper, flat, still, variant]);

    return <>
        <MapleCanopy variant={variant} backdrop={live && !still && !flat} />
        {flat ? fallback : !still && <S.Leaves ref={ref} aria-hidden="true" data-ready={live ? "" : undefined} />}
    </>;
}
