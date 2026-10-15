"use client";
/**
 * Maple 위젯의 바탕 무늬 — 앱의 단풍 장면을 닮게: 오른쪽 아래 구석에서 비스듬히 올라오는 수채 단풍 가지 한 줄기와
 * 바닥에 진 잎 둘(paintTwig — 앱 바탕의 단풍 가지와 같은 수채 잎 넷), 위쪽에서 비치는 따뜻한 빛 한 겹.
 * (사용자: "다른 위젯에서도 테마의 느낌이 잘 보이게 — 오션처럼 물결이 보인다던가" · "단풍 테마가 단풍의 느낌이 없는데")
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 위젯에 들어올 때만 2초쯤, 잎이 저마다의
 * 빠르기로 바람에 흔들렸다 잦아든다(가지 뿌리 쪽 잎부터 차례로 — 캔버스를 잎마다 다시 그린다). 움직임 '끄기'면 흔들리지 않는다.
 * 칸이 판을 채우는 위젯(달력·주간, busy)에서는 가지를 작고 옅게, 진 잎 없이 — 날짜 숫자 뒤에 잎이 겹치면 읽기 어렵다.
 * 2026-10-15: 수채 잎 그림·먹 카드 테·수채 가지 그림 → 벡터 잎 → 다시 수채 잎 가지(코드로 엮은 것)로.
 * 2026-10-16: 가지 통째로 한 번 기울던 흔들림(CSS)을 잎마다의 흔들림으로.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import * as S from "./MapleWidgetDecor.styles";
import useThemeMotion from "@/hooks/useThemeMotion";
import { loadCanopyLeaves, paintTwig, type LeafImage } from "@/components/ambient/maple/canopyPaint";
import type { WidgetKind } from "@/store/useWidgetStore";

/** 흔들림이 잦아드는 데 걸리는 시간(초) */
const SWAY_SECONDS = 2;

export default function MapleWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dark = useTheme().mode === "dark";
    const motion = useThemeMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let disposed = false;
        let imgs: LeafImage[] | null = null;
        let raf = 0;
        let start = 0;
        const draw = (sway?: number) => {
            if (!imgs || disposed) return;
            const box = canvas.getBoundingClientRect();
            if (box.width < 2 || box.height < 2) return;
            paintTwig(canvas, imgs, { width: box.width, height: box.height, dpr: Math.min(2, window.devicePixelRatio || 1), dark, busy, seed: kind, sway });
            canvas.dataset.ready = "";
        };
        loadCanopyLeaves().then((l) => { imgs = l; draw(); }).catch(() => {});
        // 위젯 창 크기를 바꾸면 다시 그린다 (끌어 늘이는 동안은 마지막에 한 번)
        let timer = 0;
        const ro = new ResizeObserver(() => { window.clearTimeout(timer); timer = window.setTimeout(() => { if (!raf) draw(); }, 160); });
        ro.observe(canvas);

        // 커서가 들어오면 한 번 — 2초 동안만 다시 그리고 멈춘 그림으로 돌아간다
        const frame = (now: number) => {
            const t = (now - start) / 1000;
            if (t >= SWAY_SECONDS) { raf = 0; draw(); return; }
            draw(t);
            raf = requestAnimationFrame(frame);
        };
        const host = ref.current?.closest<HTMLElement>("[data-widget]") ?? ref.current?.parentElement;
        const play = () => {
            if (motion === "off" || !imgs) return;
            start = performance.now();
            if (!raf) raf = requestAnimationFrame(frame);
        };
        host?.addEventListener("pointerenter", play);
        return () => {
            disposed = true;
            ro.disconnect();
            window.clearTimeout(timer);
            cancelAnimationFrame(raf);
            host?.removeEventListener("pointerenter", play);
        };
    }, [dark, busy, kind, motion]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <span className="light" />
            <canvas ref={canvasRef} className="twig" />
        </S.Decor>
    );
}
