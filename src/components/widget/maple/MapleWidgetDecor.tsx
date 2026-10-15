"use client";
/**
 * Maple 위젯의 바탕 무늬 — 앱의 단풍 장면을 닮게: 오른쪽 아래 구석에서 비스듬히 올라오는 수채 단풍 가지 한 줄기와
 * 바닥에 진 잎 둘(paintTwig — 앱 바탕의 단풍 가지와 같은 수채 잎 넷), 위쪽에서 비치는 따뜻한 빛 한 겹.
 * (사용자: "다른 위젯에서도 테마의 느낌이 잘 보이게 — 오션처럼 물결이 보인다던가" · "단풍 테마가 단풍의 느낌이 없는데")
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 가지가 바람에 한 번 흔들린다(useHoverOnce).
 * 칸이 판을 채우는 위젯(달력·주간, busy)에서는 가지를 작고 옅게, 진 잎 없이 — 날짜 숫자 뒤에 잎이 겹치면 읽기 어렵다.
 * 2026-10-15: 수채 잎 그림·먹 카드 테·수채 가지 그림 → 벡터 잎 → 다시 수채 잎 가지(코드로 엮은 것)로.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import * as S from "./MapleWidgetDecor.styles";
import useHoverOnce from "@/hooks/useHoverOnce";
import { loadCanopyLeaves, paintTwig } from "@/components/ambient/maple/canopyPaint";
import type { WidgetKind } from "@/store/useWidgetStore";

export default function MapleWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dark = useTheme().mode === "dark";
    useHoverOnce(ref, 1900);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let disposed = false;
        let imgs: HTMLImageElement[] | null = null;
        const draw = () => {
            if (!imgs || disposed) return;
            const box = canvas.getBoundingClientRect();
            if (box.width < 2 || box.height < 2) return;
            paintTwig(canvas, imgs, { width: box.width, height: box.height, dpr: Math.min(2, window.devicePixelRatio || 1), dark, busy, seed: kind });
            canvas.dataset.ready = "";
        };
        loadCanopyLeaves().then((l) => { imgs = l; draw(); }).catch(() => {});
        // 위젯 창 크기를 바꾸면 다시 그린다 (끌어 늘이는 동안은 마지막에 한 번)
        let timer = 0;
        const ro = new ResizeObserver(() => { window.clearTimeout(timer); timer = window.setTimeout(draw, 160); });
        ro.observe(canvas);
        return () => { disposed = true; ro.disconnect(); window.clearTimeout(timer); };
    }, [dark, busy, kind]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <span className="light" />
            <canvas ref={canvasRef} className="twig" />
        </S.Decor>
    );
}
