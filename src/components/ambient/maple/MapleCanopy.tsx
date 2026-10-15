"use client";
/**
 * 단풍 가지 한 장(canopyPaint) — 크기가 바뀌면 다시 그린다(멈춘 그림). 그림을 못 받으면 아무것도 그리지 않는다.
 * screen: 앱 바탕(화면 전체, 고정) · panel: 로그인 옆 그림판(판 안).
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { loadCanopyLeaves, paintCanopy, type CanopyOptions } from "./canopyPaint";
import * as S from "./MapleCanopy.styles";

export default function MapleCanopy({ variant = "screen" }: { variant?: CanopyOptions["variant"] }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const dark = useTheme().mode === "dark";

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        let disposed = false;
        let imgs: HTMLImageElement[] | null = null;
        let timer = 0;
        const draw = () => {
            if (!imgs || disposed) return;
            const box = canvas.getBoundingClientRect();
            if (box.width < 2 || box.height < 2) return;
            // 부드러운 그림이라 아주 촘촘할 까닭이 없다 — 화면 밀도 1.5 까지만(큰 화면에서 캔버스 메모리를 아낀다)
            paintCanopy(canvas, imgs, { width: box.width, height: box.height, dpr: Math.min(1.5, window.devicePixelRatio || 1), dark, variant });
            canvas.dataset.ready = "";
        };
        loadCanopyLeaves().then((l) => { imgs = l; draw(); }).catch(() => {});
        const ro = new ResizeObserver(() => {
            window.clearTimeout(timer);
            timer = window.setTimeout(draw, 140);
        });
        ro.observe(canvas);
        return () => { disposed = true; ro.disconnect(); window.clearTimeout(timer); };
    }, [dark, variant]);

    return <S.Canvas ref={ref} aria-hidden="true" data-variant={variant} />;
}
