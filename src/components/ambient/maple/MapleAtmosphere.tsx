"use client";
/**
 * Maple 의 바탕 장면 — 종이 위로 물든 잎이 3D 로 뒤집히며 진다(mapleLeafScene, three.js), 구석의 눌린 가지와 지나가는 햇살 한 겹.
 * 내용 뒤에 깔리고 누르는 것은 받지 않는다(누름은 window 에서 듣고 잎만 흩날린다). 위젯 창에서는 ThemeAtmosphere 가 아예 건너뛴다.
 * WebGL 이나 잎 그림이 없으면 예전의 납작한 SVG 잎 다섯 장(CSS 로 떨어진다)으로 물러난다.
 */
import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import * as S from "./MapleAtmosphere.styles";

const LEAF = 'M24 4l5 12 9-5-3 14 10 2-13 8 1 12-9-6-9 6 1-12-13-8 10-2-3-14 9 5Z';

export default function MapleAtmosphere() {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const [flat, setFlat] = useState(false);
    const dark = theme.mode === "dark";
    const paper = theme.colors.background;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || flat) return;
        let disposed = false;
        let scene: { dispose(): void } | null = null;
        (async () => {
            try {
                const [THREE, { createLeafScene }] = await Promise.all([import("three"), import("./mapleLeafScene")]);
                if (disposed) return;
                scene = createLeafScene(THREE, canvas, { dark, motion, paper, onFail: () => setFlat(true) });
            } catch {
                if (!disposed) setFlat(true); // WebGL 이 없다 — CSS 잎으로
            }
        })();
        return () => { disposed = true; scene?.dispose(); };
    }, [dark, motion, paper, flat]);

    return <S.Garden aria-hidden="true" data-ambient="maple">
        {flat
            ? Array.from({length:5},(_,i)=><span className={`fall leaf-${i}`} key={i}>
                <svg className="leaf" viewBox="0 0 48 54"><path d={LEAF} /><path className="vein" d="M24 17v36m0-24-12-7m12 13 13-9" /></svg>
            </span>)
            : <S.Leaves ref={ref} />}
        <svg className="pressed" viewBox="0 0 100 100" fill="none"><path d="M10 95Q45 52 64 12M35 60l-13-25M46 44l28 5M55 28l-7-20" /><path d="M22 35Q-1 23 6 11q22-1 16 24ZM74 49q25-12 20-25-26-2-20 25ZM48 8q-21 5-15 18 17 1 15-18Z" /></svg>
        <div className="paper-light" />
    </S.Garden>;
}
